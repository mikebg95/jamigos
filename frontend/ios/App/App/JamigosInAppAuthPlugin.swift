import Foundation
import Capacitor

@objc(JamigosInAppAuthPlugin)
public class JamigosInAppAuthPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "JamigosInAppAuthPlugin"
    public let jsName = "JamigosInAppAuth"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "openAuth", returnType: CAPPluginReturnPromise)
    ]

    @objc func openAuth(_ call: CAPPluginCall) {
        let url = call.getString("url") ?? ""

        // For now, immediately resolve without doing anything
        // This is a placeholder for future in-app auth implementation
        call.resolve()
    }
}
