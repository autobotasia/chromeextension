Tracker.trackPageView();const storageController=new StorageController,urlObj=new URL(location.href),formElement=document.querySelector("#feedback-form"),headlineElement=document.querySelector("#headline"),senderElement=document.querySelector("#sender"),textElement=document.querySelector("#text"),successElement=document.querySelector("#success-message"),directMailElement=document.querySelector("#feedback-form-direct-email");translateSection(document.documentElement),urlObj.searchParams.get("title")&&(headlineElement.textContent=urlObj.searchParams.get("title"));const html=urlObj.searchParams.get("html"),url=urlObj.searchParams.get("url"),hostName=getHostNameFromUrl(url),manifestObj=browser.runtime.getManifest(),version=manifestObj&&manifestObj.version||"unknown",subject=`Feedback LanguageTool on ${hostName} (v${version}, lang: ${navigator.language}, browser: ${BrowserDetector.getBrowserName()})`,linkHtml=`<a href="mailto:feedback@languagetool.org?subject=${encodeURIComponent(subject)}">feedback@languagetool.org</a>`;directMailElement.innerHTML=browser.i18n.getMessage("feedbackDirectMail",[linkHtml]),formElement.addEventListener("submit",e=>{e.preventDefault();const n=senderElement.value;Tracker.trackEvent("Action","send_feedback",n),storageController.onReady(()=>{const{firstVisit:e,ratingValue:t,sessionCount:r}=storageController.getStatistics(),{hasPaidSubscription:o}=storageController.getUIState(),{geoIpLanguages:a,apiServerUrl:s,knownEmail:l,username:i,geoIpCountry:c,ignoredRules:g}=storageController.getSettings(),m=g.filter(e=>!StorageController.DEFAULT_SETTINGS.ignoredRules.find(n=>n.id===e.id));let u=`From: ${senderElement.value}\n`;u+=`Paying: ${o}\n`,u+=`Account: ${i||"none"}\n`,u+=`Other known email: ${l||i}\n`,u+=`Addon Version: ${version}\n`,u+=`Accept-Languages: ${navigator.languages.join(", ")}\n`,u+=`UI-Language: ${browser.i18n.getUILanguage()}\n`,u+=`GeoIP-Languages: ${a.join(", ")}\n`,u+=`Country: ${c}\n`,u+=`Full URL: ${url}\n`,u+=`HTML: ${html||""}\n`,u+=`Matomo: ${storageController.getUniqueId()}\n`,u+=`User Agent: ${navigator.userAgent}\n`,u+=`CPU Cores: ${navigator.hardwareConcurrency}\n`,u+=`User since: ${new Date(1e3*e).toUTCString()}\n`,u+=`Rating: ${t}\n`,u+=`Sessions: ${r}\n`,u+=`API: ${s}\n`,u+=`DNT: ${navigator.doNotTrack}\n`,u+=`Downlink: ${navigator.connection&&navigator.connection.downlink}\n`,u+=`Connection Type: ${navigator.connection&&navigator.connection.effectiveType}\n`,u+=`Ignored Rules: ${m.map(e=>e.id).join(",")}\n`;const d=`${textElement.value}\n\n\n${u}`;storageController.updateSettings({knownEmail:n}),browser.runtime.sendMessage({command:"SEND_FEEDBACK",sender:senderElement.value,text:d}).then(()=>{formElement.style.display="none",successElement.style.display="block"}).catch(()=>{Tracker.trackError("message","error_send_feedback"),alert(browser.i18n.getMessage("feedbackError"))})})});