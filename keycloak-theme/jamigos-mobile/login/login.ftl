<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>
    <#if section = "header">
        <h2 id="kc-page-title">${msg("loginAccountTitle")}</h2>
    <#elseif section = "form">
        <#-- Quick Register Link (above form) -->
        <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
            <div class="text-center" style="margin-bottom: 1.5rem;">
                <span>${msg("noAccount")} <a href="${url.registrationUrl}" class="link-primary">${msg("doRegister")}</a></span>
            </div>
        </#if>

        <div id="kc-form">
            <div id="kc-form-wrapper">
                <#if realm.password>
                    <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">

                        <#-- Username or Email Field -->
                        <div class="form-group">
                            <label for="username" class="form-label <#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if>">
                                <#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if>
                            </label>
                            <input tabindex="1"
                                   id="username"
                                   name="username"
                                   value="${(login.username!'')}"
                                   type="text"
                                   autofocus
                                   autocomplete="username"
                                   <#if messagesPerField.existsError('username','password')>aria-invalid="true"</#if>
                            />
                            <#if messagesPerField.existsError('username','password')>
                                <span class="input-error" aria-live="polite">
                                    ${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}
                                </span>
                            </#if>
                        </div>

                        <#-- Password Field -->
                        <div class="form-group">
                            <label for="password" class="form-label">${msg("password")}</label>
                            <input tabindex="2"
                                   id="password"
                                   name="password"
                                   type="password"
                                   autocomplete="current-password"
                                   <#if messagesPerField.existsError('username','password')>aria-invalid="true"</#if>
                            />
                        </div>

                        <#-- Remember Me Checkbox -->
                        <#if realm.rememberMe && !usernameHidden??>
                            <div class="form-group">
                                <div class="checkbox-wrapper">
                                    <input tabindex="3"
                                           id="rememberMe"
                                           name="rememberMe"
                                           type="checkbox"
                                           <#if login.rememberMe??>checked</#if>
                                    />
                                    <label for="rememberMe">${msg("rememberMe")}</label>
                                </div>
                            </div>
                        </#if>

                        <#-- Form Buttons -->
                        <div id="kc-form-buttons">
                            <input type="hidden" id="id-hidden-input" name="credentialId" <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>
                            <input tabindex="4"
                                   class="btn-primary btn-block"
                                   name="login"
                                   id="kc-login"
                                   type="submit"
                                   value="${msg("doLogIn")}"
                            />
                        </div>

                        <#-- Forgot Password Link -->
                        <#if realm.resetPasswordAllowed>
                            <div id="kc-form-options">
                                <div class="text-center">
                                    <a tabindex="5" href="${url.loginResetCredentialsUrl}" class="link-secondary">${msg("doForgotPassword")}</a>
                                </div>
                            </div>
                        </#if>

                    </form>
                </#if>
            </div>

            <#-- Social Providers -->
            <#if realm.password && social.providers??>
                <div id="kc-social-providers">
                    <hr/>
                    <h4 class="text-center">${msg("identity-provider-login-label")}</h4>
                    <ul class="social-providers">
                        <#list social.providers as p>
                            <li>
                                <a id="social-${p.alias}"
                                   class="social-provider-button"
                                   href="${p.loginUrl}">
                                    <#if p.iconClasses?has_content>
                                        <i class="${p.iconClasses!}" aria-hidden="true"></i>
                                    </#if>
                                    <span>${p.displayName!}</span>
                                </a>
                            </li>
                        </#list>
                    </ul>
                </div>
            </#if>

        </div>
    <#elseif section = "info" >
        <#-- Registration Link -->
        <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
            <div id="kc-registration">
                <span>${msg("noAccount")} <a tabindex="6" href="${url.registrationUrl}">${msg("doRegister")}</a></span>
            </div>
        </#if>
    </#if>

</@layout.registrationLayout>
