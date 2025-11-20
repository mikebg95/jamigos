<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false displayInfo=false; section>
    <#if section = "header">
        <#-- No page title needed -->
    <#elseif section = "form">
        <div class="spinner-center">
            <p class="logout-message">You are being logged out</p>
            <div class="spinner" role="status">
                <span class="sr-only">Logging out...</span>
            </div>
        </div>

        <#-- Hidden form that auto-submits -->
        <form id="kc-logout-form" action="${url.logoutConfirmAction}" method="POST" style="display:none;">
            <input type="hidden" name="session_code" value="${logoutConfirm.code}" />
        </form>

        <script>
            // Auto-submit immediately to process logout
            document.getElementById('kc-logout-form').submit();
        </script>
    </#if>
</@layout.registrationLayout>
