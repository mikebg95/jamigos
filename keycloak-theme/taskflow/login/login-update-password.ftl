<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('password','password-confirm'); section>
    <#if section = "header">
        ${msg("updatePasswordTitle")}
    <#elseif section = "form">
        <div id="kc-form">
            <div id="kc-form-wrapper">
                <form id="kc-passwd-update-form" action="${url.loginAction}" method="post">
                    <input type="text" id="username" name="username" value="${username}" autocomplete="username"
                           readonly="readonly" style="display:none;"/>
                    <input type="password" id="password" name="password" autocomplete="current-password" style="display:none;"/>

                    <div class="ds-auth-field">
                        <label for="password-new" class="ds-auth-label required">${msg("passwordNew")}</label>
                        <input type="password" id="password-new" name="password-new" class="ds-auth-input<#if messagesPerField.existsError('password','password-confirm')> error</#if>" autofocus autocomplete="new-password"
                               aria-invalid="<#if messagesPerField.existsError('password','password-confirm')>true</#if>"
                        />

                        <#if messagesPerField.existsError('password')>
                            <span class="ds-field-error" aria-live="polite">
                                ${kcSanitize(messagesPerField.get('password'))?no_esc}
                            </span>
                        </#if>
                    </div>

                    <div class="ds-auth-field">
                        <label for="password-confirm" class="ds-auth-label required">${msg("passwordConfirm")}</label>
                        <input type="password" id="password-confirm" name="password-confirm" class="ds-auth-input<#if messagesPerField.existsError('password-confirm')> error</#if>"
                               autocomplete="new-password"
                               aria-invalid="<#if messagesPerField.existsError('password-confirm')>true</#if>"
                        />

                        <#if messagesPerField.existsError('password-confirm')>
                            <span class="ds-field-error" aria-live="polite">
                                ${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}
                            </span>
                        </#if>
                    </div>

                    <div class="ds-auth-field" style="margin-top: var(--ds-spacing-xl);">
                        <button type="submit" class="ds-auth-button">${msg("doSubmit")}</button>
                    </div>
                </form>
            </div>
        </div>
    </#if>
</@layout.registrationLayout>
