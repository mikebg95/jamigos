import UIKit
import Capacitor

@objc(MainViewController)
class MainViewController: CAPBridgeViewController {

    override open func capacitorDidLoad() {
        super.capacitorDidLoad()

        // Register custom in-app auth plugin
        bridge?.registerPluginInstance(JamigosInAppAuthPlugin())
    }
}
