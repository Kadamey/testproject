sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"ItelliMES/model/models"
], function(UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("ItelliMES.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			this.getRouter().initialize();
			// set the device model
			this.setModel(models.createDeviceModel(), "device");

	//this.renderRecastChatbot();
		},

		renderRecastChatbot: function() {
	if (!document.getElementById("cai-webchat")) {
		var s = document.createElement("script");
	 	  s.setAttribute("id", "cai-webchat");
		  s.setAttribute("src", "https://cdn.cai.tools.sap/webchat/webchat.js");
			  document.body.appendChild(s);
		}
		s.setAttribute("channelId", "217525dc-f8da-4f08-9757-d676266d820b");
		s.setAttribute("token", "c1a4b9223992ed72d8df0f1ae90c08a9");
}
	});
});