<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false; section>
    <#if section = "header">
        <#if messageHeader??>
            ${messageHeader}
        <#else>
            ${message.summary}
        </#if>
    <#elseif section = "form">
        <div id="kc-info-message">
            <div class="ds-auth-message info">
                <p class="instruction">
                    ${kcSanitize(message.summary)?no_esc}
                    <#if requiredActions??><#list requiredActions>: <b><#items as reqActionItem>${kcSanitize(msg("requiredAction.${reqActionItem}"))?no_esc}<#sep>, </#items></b></#list><#else></#if>
                </p>
                <#if skipLink??>
                <#else>
                    <#if pageRedirectUri?has_content>
                        <p style="margin-top: var(--ds-spacing-lg); text-align: center;">
                            <a href="${pageRedirectUri}" class="ds-auth-link">${kcSanitize(msg("backToApplication"))?no_esc}</a>
                        </p>
                    <#elseif actionUri?has_content>
                        <p style="margin-top: var(--ds-spacing-lg); text-align: center;">
                            <a href="${actionUri}" class="ds-auth-link">${kcSanitize(msg("proceedWithAction"))?no_esc}</a>
                        </p>
                    <#elseif (client.baseUrl)?has_content>
                        <p style="margin-top: var(--ds-spacing-lg); text-align: center;">
                            <a href="${client.baseUrl}" class="ds-auth-link">${kcSanitize(msg("backToApplication"))?no_esc}</a>
                        </p>
                    </#if>
                </#if>
            </div>
        </div>
    </#if>
</@layout.registrationLayout>
