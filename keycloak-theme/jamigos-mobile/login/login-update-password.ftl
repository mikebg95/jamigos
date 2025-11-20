<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('password','password-confirm'); section>
    <#if section = "header">
        <h2 id="kc-page-title">${msg("updatePasswordTitle")}</h2>
    <#elseif section = "form">
        <form id="kc-passwd-update-form" action="${url.loginAction}" method="post">
            <input type="text" id="username" name="username" value="${username}" autocomplete="username" readonly="readonly" style="display:none;"/>
            <input type="password" id="password" name="password" autocomplete="current-password" style="display:none;"/>

            <#-- New Password Field -->
            <div class="form-group">
                <label for="password-new" class="form-label required">
                    ${msg("passwordNew")}
                </label>
                <input type="password"
                       id="password-new"
                       name="password-new"
                       autofocus
                       autocomplete="new-password"
                       <#if messagesPerField.existsError('password','password-confirm')>aria-invalid="true"</#if>
                />
                <#if messagesPerField.existsError('password')>
                    <span class="input-error" aria-live="polite">
                        ${kcSanitize(messagesPerField.get('password'))?no_esc}
                    </span>
                </#if>
            </div>

            <#-- Confirm Password Field -->
            <div class="form-group">
                <label for="password-confirm" class="form-label required">
                    ${msg("passwordConfirm")}
                </label>
                <input type="password"
                       id="password-confirm"
                       name="password-confirm"
                       autocomplete="new-password"
                       <#if messagesPerField.existsError('password-confirm')>aria-invalid="true"</#if>
                />
                <#if messagesPerField.existsError('password-confirm')>
                    <span class="input-error" aria-live="polite">
                        ${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}
                    </span>
                </#if>
            </div>

            <div id="kc-form-buttons">
                <#if isAppInitiatedAction??>
                    <input class="btn-primary btn-block"
                           type="submit"
                           value="${msg("doSubmit")}"
                    />
                    <button class="btn-outline btn-block"
                            type="submit"
                            name="cancel-aia"
                            value="true">
                        ${msg("doCancel")}
                    </button>
                <#else>
                    <input class="btn-primary btn-block"
                           type="submit"
                           value="${msg("doSubmit")}"
                    />
                </#if>
            </div>
        </form>
    </#if>
</@layout.registrationLayout>
