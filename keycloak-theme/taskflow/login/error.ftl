<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false; section>
    <#if section = "header">
        ${msg("errorTitle")}
    <#elseif section = "form">
        <div id="kc-error-message">
            <div class="ds-auth-message error">
                <p id="instruction1" class="instruction">
                    ${kcSanitize(message.summary!'')?no_esc}
                </p>
                <#if skipLink??>
                <#else>
                    <#if client?? && client.baseUrl?has_content>
                        <p style="margin-top: var(--ds-spacing-lg); text-align: center;">
                            <a id="backToApplication" href="${client.baseUrl}" class="ds-auth-link">${kcSanitize(msg("backToApplication"))?no_esc}</a>
                        </p>
                    </#if>
                </#if>
            </div>
        </div>
    </#if>
</@layout.registrationLayout>
