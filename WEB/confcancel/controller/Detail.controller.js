sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'editConfirmation/scripts/transactionCaller'
], function (Controller,TransactionCaller) {
	"use strict";

	return Controller.extend("editConfirmation.controller.Detail", {
		onInit: function () {
			this.oOwnerComponent = this.getOwnerComponent();

			this.oRouter = this.oOwnerComponent.getRouter();
			this.oModel = this.oOwnerComponent.getModel();


			//this.oRouter.getRoute("master").attachPatternMatched(this._onConfMatch, this);
			this.oRouter.getRoute("detail").attachPatternMatched(this._onConfMatch, this);

		},


		_getDetailHeader : function(){

			TransactionCaller.async(
				"ECZ_MES-4.0/COMMON/CONF_CANCEL/T_GetDetailHeader",
				{

					I_CONFNO: this._confNo

				},
				"O_JSON",
				this._onGetDetailHeaderCB,
				this,
				"GET"
			);


		},

		_onGetDetailHeaderCB: function (iv_data, iv_scope) {

		
              var myModel = new sap.ui.model.json.JSONModel();
                myModel.setData(iv_data[0].Rowsets.Rowset.Row);
              iv_scope.getView().setModel(myModel,"header");

		},

		_onConfMatch: function (oEvent) {

			this._confNo = oEvent.getParameter("arguments").confNo || this._confNo || "";
			
			this._getDetailHeader();

			TransactionCaller.async(
				"ECZ_MES-4.0/COMMON/CONF_CANCEL/T_GetTimeTicketandGoodsMvtInfo",
				{

					I_ME_CONF_COUNT: this._confNo

				},
				"O_JSON",
				this.onPressOrderHeaderTableCB,
				this,
				"GET"
			);

		},


		onPressOrderHeaderTableCB: function (iv_data, iv_scope) {

			var myModel = new sap.ui.model.json.JSONModel();
			
			var myModel2 = new sap.ui.model.json.JSONModel();
						
			
			myModel.setData(iv_data[0].Result);
			iv_scope.getView().byId("idGoodsMovementTable").setModel(myModel);
			


			
		//time tickets icin yapıldı, gerekirse goods movement içinde eklenecek
			if(Array.isArray(iv_data[0].Result.Timetickets.Rowsets.Rowset.Row)==false){
				myModel2.setData(Array(iv_data[0].Result.Timetickets.Rowsets.Rowset.Row));
			}else{
				myModel2.setData(iv_data[0].Result.Timetickets.Rowsets.Rowset.Row);
			}
			iv_scope.getView().byId("idOrderTimeTicketsTable").setModel(myModel2);


		},


		onEditToggleButtonPress: function() {
			var oObjectPage = this.getView().byId("ObjectPageLayout"),
				bCurrentShowFooterState = oObjectPage.getShowFooter();

			oObjectPage.setShowFooter(!bCurrentShowFooterState);
		},

		handleFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.oRouter.navTo("detail", {layout: sNextLayout, confNo: this._confNo});
		},

		handleExitFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oRouter.navTo("detail", {layout: sNextLayout, confNo: this._confNo});
		},

		handleClose: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			this.oRouter.navTo("master", {layout: sNextLayout});
		},

		onExit: function () {
			//this.oRouter.getRoute("master").detachPatternMatched(this._onConfMatch, this);
			this.oRouter.getRoute("detail").detachPatternMatched(this._onConfMatch, this);
		}
	});
});
