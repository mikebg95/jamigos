<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false; section>
    <#if section = "header">
        <h2 id="kc-page-title">${msg("errorTitle")}</h2>
    <#elseif section = "form">
        <div id="kc-error-message">
            <#if message?has_content && message.summary??>
                <div class="alert alert-error">
                    <span class="kc-feedback-text">${kcSanitize(message.summary)?no_esc}</span>
                </div>
            </#if>

            <#if skipLink??>
                <!-- Skip link content here if needed -->
            <#else>
                <#if client?? && client.baseUrl?has_content>
                    <p class="text-center mt-3">
                        <a id="backToApplication" href="${client.baseUrl}" class="link-secondary">
                            ${kcSanitize(msg("backToApplication"))?no_esc}
                        </a>
                    </p>
                </#if>
            </#if>
        </div>
    </#if>
</@layout.registrationLayout>

