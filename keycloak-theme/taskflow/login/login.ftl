<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=(realm.password && realm.registrationAllowed && !(registrationDisabled!false)); section>
    <#if section = "header">
        Sign in to your account
    <#elseif section = "form">
    <div id="kc-form">
      <div id="kc-form-wrapper">
        <#if realm.password>
            <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
                <#if !usernameHidden??>
                    <div class="ds-auth-field">
                        <label for="username" class="ds-auth-label <#if !realm.loginWithEmailAllowed>required</#if>">
                            <#if !realm.loginWithEmailAllowed>Username<#elseif !realm.registrationEmailAsUsername>Username or email<#else>Email</#if>
                        </label>
                        <input tabindex="1" id="username" class="ds-auth-input<#if messagesPerField.existsError('username','password')> error</#if>" name="username" value="${(login.username!'')}"  type="text" autofocus autocomplete="off"
                               aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
                        />

                        <#if messagesPerField.existsError('username','password')>
                            <span class="ds-field-error" aria-live="polite">
                                ${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}
                            </span>
                        </#if>
                    </div>
                </#if>

                <div class="ds-auth-field">
                    <label for="password" class="ds-auth-label required">Password</label>
                    <input tabindex="2" id="password" class="ds-auth-input<#if messagesPerField.existsError('username','password')> error</#if>" name="password" type="password" autocomplete="off"
                           aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
                    />
                </div>

                <div class="ds-auth-links">
                    <#if realm.rememberMe && !usernameHidden??>
                        <div class="ds-auth-checkbox">
                            <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox" <#if login.rememberMe??>checked</#if>>
                            <label for="rememberMe">Remember me</label>
                        </div>
                    <#else>
                        <div></div>
                    </#if>

                    <#if realm.resetPasswordAllowed>
                        <a tabindex="5" href="${url.loginResetCredentialsUrl}" class="ds-auth-link">Forgot password?</a>
                    </#if>
                </div>

                <#if !usernameHidden??>
                    <input type="hidden" id="id-hidden-input" name="credentialId" <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>
                </#if>

                <div class="ds-auth-field" style="margin-top: var(--ds-spacing-xl);">
                    <input type="hidden" name="credentialId" <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>
                    <button tabindex="4" class="ds-auth-button" name="login" id="kc-login" type="submit">Sign In</button>
                </div>
            </form>
        </#if>
        </div>
    </div>
    <#elseif section = "info" >
        <#if realm.password && realm.registrationAllowed && !(registrationDisabled!false)>
            <div id="kc-registration-container">
                <div id="kc-registration">
                    <span>Don't have an account? <a tabindex="6" href="${url.registrationUrl}" class="ds-auth-link">Register</a></span>
                </div>
            </div>
        </#if>
    <#elseif section = "socialProviders" >
        <#if realm.password && social.providers??>
            <div id="kc-social-providers" class="ds-social-providers">
                <#list social.providers as p>
                    <a id="social-${p.alias}" class="ds-social-button" type="button" href="${p.loginUrl}">
                        <#if p.iconClasses?has_content>
                            <i class="${p.iconClasses}" aria-hidden="true"></i>
                            <span>${p.displayName}</span>
                        <#else>
                            <span>${p.displayName}</span>
                        </#if>
                    </a>
                </#list>
            </div>

            <div class="ds-social-divider">
                <span>or</span>
            </div>
        </#if>
    </#if>

</@layout.registrationLayout>
