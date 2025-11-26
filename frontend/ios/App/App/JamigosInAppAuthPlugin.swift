import Foundation
import UIKit
import Capacitor
import WebKit

@objc(JamigosInAppAuthPlugin)
public class JamigosInAppAuthPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "JamigosInAppAuthPlugin"
    public let jsName = "JamigosInAppAuth"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "openAuth", returnType: CAPPluginReturnPromise)
    ]

    private var currentCall: CAPPluginCall?

    @objc func openAuth(_ call: CAPPluginCall) {
        // Validate URL parameter
        guard let urlString = call.getString("url"), !urlString.isEmpty,
              let url = URL(string: urlString) else {
            call.reject("Invalid URL")
            return
        }

        // Store the call so we can resolve it later
        currentCall = call

        // Present the auth UI on the main thread
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }

            let authVC = InAppAuthViewController(url: url)

            // Handle manual close (user taps ✕ button)
            authVC.onClose = { [weak self] in
                guard let self = self else { return }

                // Send cancellation deep link so JS side can detect cancellation
                if let cancelUrl = URL(string: "com.jamigos.app://auth/callback?error=cancelled&error_description=User%20cancelled") {
                    DispatchQueue.main.async {
                        if UIApplication.shared.canOpenURL(cancelUrl) {
                            UIApplication.shared.open(cancelUrl, options: [:], completionHandler: nil)
                        }
                    }
                }

                // Dismiss the modal and resolve the plugin call
                self.bridge?.viewController?.dismiss(animated: true, completion: nil)
                self.currentCall?.resolve()
                self.currentCall = nil
            }

            // Handle callback URL (Keycloak redirects to com.jamigos.app://)
            authVC.onCallback = { [weak self] callbackUrl in
                guard let self = self else { return }

                // Ask iOS to open the URL so Capacitor / AppDelegate can handle it
                DispatchQueue.main.async {
                    if UIApplication.shared.canOpenURL(callbackUrl) {
                        UIApplication.shared.open(callbackUrl, options: [:], completionHandler: nil)
                    }
                }

                // Dismiss the auth VC and resolve the plugin call
                self.bridge?.viewController?.dismiss(animated: true, completion: nil)
                self.currentCall?.resolve()
                self.currentCall = nil
            }

            // Get the root view controller to present from
            if let rootVC = self.bridge?.viewController {
                rootVC.present(authVC, animated: true, completion: nil)
            }
        }
    }
}

// MARK: - InAppAuthViewController

class InAppAuthViewController: UIViewController, WKNavigationDelegate {
    private var webView: WKWebView!
    private var closeButton: UIButton!
    private let url: URL

    var onClose: (() -> Void)?
    var onCallback: ((URL) -> Void)?

    init(url: URL) {
        self.url = url
        super.init(nibName: nil, bundle: nil)
        self.modalPresentationStyle = .fullScreen
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        setupWebView()
        setupCloseButton()

        // Load the URL
        let request = URLRequest(url: url)
        webView.load(request)
    }

    private func setupWebView() {
        // Create WKWebView
        let config = WKWebViewConfiguration()
        webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = self
        webView.translatesAutoresizingMaskIntoConstraints = false

        view.addSubview(webView)

        // Fill entire screen with Auto Layout
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.topAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
    }

    private func setupCloseButton() {
        // Create close button with ✕ symbol
        closeButton = UIButton(type: .system)
        closeButton.setTitle("✕", for: .normal)
        closeButton.titleLabel?.font = UIFont.systemFont(ofSize: 24, weight: .medium)
        closeButton.setTitleColor(.label, for: .normal)
        closeButton.backgroundColor = UIColor.systemBackground.withAlphaComponent(0.9)
        closeButton.layer.cornerRadius = 20
        closeButton.translatesAutoresizingMaskIntoConstraints = false
        closeButton.addTarget(self, action: #selector(closeButtonTapped), for: .touchUpInside)

        view.addSubview(closeButton)

        // Position in top-right corner within safe area
        NSLayoutConstraint.activate([
            closeButton.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 16),
            closeButton.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor, constant: -16),
            closeButton.widthAnchor.constraint(equalToConstant: 40),
            closeButton.heightAnchor.constraint(equalToConstant: 40)
        ])
    }

    @objc private func closeButtonTapped() {
        dismiss(animated: true) { [weak self] in
            self?.onClose?()
        }
    }

    // MARK: - WKNavigationDelegate

    func webView(_ webView: WKWebView,
                 decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        // Intercept custom scheme redirects (e.g., com.jamigos.app://auth/callback)
        if let url = navigationAction.request.url,
           url.scheme == "com.jamigos.app" {
            // Notify plugin and prevent WKWebView from trying to load this URL
            onCallback?(url)
            decisionHandler(.cancel)
            return
        }

        // Allow all other navigation
        decisionHandler(.allow)
    }
}
