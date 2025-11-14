<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=true displayMessage=!messagesPerField.existsError('username'); section>
    <#if section = "header">
        ${msg("emailForgotTitle")}
    <#elseif section = "form">
        <div id="kc-form">
            <div id="kc-form-wrapper">
                <form id="kc-reset-password-form" action="${url.loginAction}" method="post">
                    <div class="ds-auth-field">
                        <label for="username" class="ds-auth-label required">
                            <#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if>
                        </label>
                        <input type="text" id="username" name="username" class="ds-auth-input<#if messagesPerField.existsError('username')> error</#if>" autofocus value="${(auth.attemptedUsername!'')}"
                               aria-invalid="<#if messagesPerField.existsError('username')>true</#if>"
                        />

                        <#if messagesPerField.existsError('username')>
                            <span class="ds-field-error" aria-live="polite">
                                ${kcSanitize(messagesPerField.get('username'))?no_esc}
                            </span>
                        </#if>
                    </div>

                    <div class="ds-auth-field" style="margin-top: var(--ds-spacing-xl);">
                        <button type="submit" class="ds-auth-button">${msg("doSubmit")}</button>
                    </div>

                    <div class="ds-auth-links" style="justify-content: center; margin-top: var(--ds-spacing-lg);">
                        <a href="${url.loginUrl}" class="ds-auth-link">${kcSanitize(msg("backToLogin"))?no_esc}</a>
                    </div>
                </form>
            </div>
        </div>
    <#elseif section = "info">
        <p>${msg("emailInstruction")}</p>
    </#if>
</@layout.registrationLayout>
