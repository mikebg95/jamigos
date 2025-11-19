<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false displayInfo=false; section>
    <#if section = "header">
        <#-- No page title, logo handles branding -->
    <#elseif section = "form">
        <div class="spinner-center">
            <p class="logout-message">${msg("logoutConfirmTitle")}</p>
            <div class="spinner" role="status">
                <span class="sr-only">Loading...</span>
            </div>
        </div>

        <#-- Auto-redirect form (Keycloak handles the logout) -->
        <#if logoutConfirm??>
            <form id="kc-logout-form" action="${url.logoutConfirmAction}" method="POST" style="display:none;">
                <input type="hidden" name="session_code" value="${logoutConfirm.code}" />
            </form>
            <script>
                // Auto-submit logout form after brief delay to show the spinner
                setTimeout(function() {
                    document.getElementById('kc-logout-form').submit();
                }, 500);
            </script>
        </#if>
    </#if>
</@layout.registrationLayout>
