<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false displayInfo=false; section>
    <#if section = "header">
        <script>
            document.title = "Logging out...";
        </script>
    <#elseif section = "form">
        <div class="spinner-center">
            <p class="logout-message">You are being logged out</p>
            <div class="spinner" role="status">
                <span class="sr-only">Logging out...</span>
            </div>
        </div>

        <#-- Hidden iframes to process frontchannel logout for each client -->
        <#if logout.clients?has_content>
            <#list logout.clients as client>
                <iframe src="${client.frontChannelLogoutUrl}" style="display:none;"></iframe>
            </#list>
        </#if>

        <#-- Auto-redirect after logout completes -->
        <#if logout.logoutRedirectUri?has_content>
            <script>
                function readystatechange(event) {
                    if (document.readyState === 'complete') {
                        window.location.replace('${logout.logoutRedirectUri}');
                    }
                }
                document.addEventListener('readystatechange', readystatechange);
            </script>
        </#if>
    </#if>
</@layout.registrationLayout>
