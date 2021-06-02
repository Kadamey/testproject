sap.ui.define(
	[
		"sap/m/MessageToast",
		"sap/ui/core/mvc/Controller",
		"customOrderScreen/scripts/transactionCaller",
		"sap/ui/table/RowSettings",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageBox",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/m/Dialog",
        "sap/m/Text",
        "sap/m/TextArea",
        "sap/m/Button",
        "sap/m/DialogType",
        "sap/m/ButtonType",
		"sap/ui/core/BusyIndicator"
	],
	function (
		MessageToast,
		Controller,
		TransactionCaller,
		RowSettings,
		JSONModel,
		MessageBox,
		Filter,
		FilterOperator,
		Dialog,
        Text,
        TextArea,
        Button,
        DialogType,
		ButtonType,
		BusyIndicator
	) {
		"use strict";
		var oRouter, selectedParentSfc;

		return Controller.extend("customOrderScreen.controller.tamponLoadScreen", {
			onInit: function () {
				oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.getRoute("RouteMain3").attachPatternMatched(this._onRoute, this);
			},

			_onRoute: function (oEvent) {
				selectedParentSfc = oEvent.getParameter("arguments").PARENTSFC;
				this.getInitialDatas();
			},

			getInitialDatas: function () {
				var dateFilter = "",
					timeFilter = "";
				if (this.getView().byId("INP7").getDateValue() != null) {
					dateFilter = this.getView().byId("INP7").getDateValue().toLocaleDateString();
				}

				if (this.getView().byId("INP8").getSelectedKey() != "") {
					if (this.getView().byId("INP7").getDateValue() == null) {
						MessageToast.show("Lütfen geçerli bir tarih girişi yapınız");
						return;
					} else {
						timeFilter = this.getView().byId("INP8").getSelectedKey();
					}
				}

				TransactionCaller.async("ECZ_MES-4.0/KAGIT/DM_MANAGEMENT/COMBINE_ORDER/BOBIN_LIST/T_GetInventoryListFromSfc", {
						I_PARENT_SFC: selectedParentSfc,
						I_FILTER1: this.getView().byId("INP1").getValue(),
						I_FILTER2: this.getView().byId("INP2").getValue(),
						I_FILTER3: this.getView().byId("INP3").getValue(),
						I_FILTER4: this.getView().byId("INP4").getValue(),
						I_FILTER5: this.getView().byId("INP5").getValue(),
						I_FILTER6: this.getView().byId("INP6").getValue(),
						I_FILTER7: dateFilter,
						I_FILTER8: timeFilter,
						I_FILTER9: this.getView().byId("INP9").getSelectedKey(),
					},
					"O_JSON",
					this.getInitialDatasCB,
					this,
					"GET"
				);
			},

			getInitialDatasCB: function (iv_data, iv_scope) {
				var myModel = new sap.ui.model.json.JSONModel();
				if (Array.isArray(iv_data[0]?.Rowsets?.Rowset?.Row)) {
					myModel.setData(iv_data[0]);
				} else if (!iv_data[0]?.Rowsets?.Rowset?.Row) {
					myModel.setData(null);
				} else {
					var obj_iv_data = iv_data[0];
					var dummyData = [];
					dummyData.push(iv_data[0].Rowsets.Rowset.Row);
					obj_iv_data.Rowsets.Rowset.Row = dummyData;
					myModel.setData(obj_iv_data);
				}

				iv_scope.getView().byId("idInventoryListTable").setModel(myModel);
				iv_scope.getView().byId("idInventoryListTable").getModel().refresh();

				var subTotal1 = 0,
					subTotal2 = 0,
					subTotal3 = 0,
					subTotal4 = 0,
					subTotal5 = 0,
					subTotal6 = 0;
				for (var i = 0; i < myModel.getData()?.Rowsets?.Rowset?.Row?.length; i++) {
					subTotal1 = subTotal1 + Number(myModel.getData().Rowsets.Rowset.Row[i].ORIGINAL_QTY);
					subTotal2 = subTotal2 + Number(myModel.getData().Rowsets.Rowset.Row[i].QTY_ON_HAND);
					subTotal3 = subTotal3 + Number(myModel.getData().Rowsets.Rowset.Row[i].TOTALDEFECT);
					subTotal4 = subTotal4 + Number(myModel.getData().Rowsets.Rowset.Row[i].NC_GROUP001);
					subTotal5 = subTotal5 + Number(myModel.getData().Rowsets.Rowset.Row[i].NC_GROUP002);
					subTotal6 = subTotal6 + Number(myModel.getData().Rowsets.Rowset.Row[i].NC_GROUP003);
				}

				iv_scope.getView().byId("subTotal1").setText("Toplam Orijinal Miktar : " + subTotal1);
				iv_scope.getView().byId("subTotal2").setText("Toplam Kalan Miktar : " + subTotal2);
				iv_scope.getView().byId("subTotal3").setText("Toplam Deşe : " + subTotal3);
				iv_scope.getView().byId("subTotal4").setText("Toplam Kalite Deşesi : " + subTotal4);
				iv_scope.getView().byId("subTotal5").setText("Toplam Diğer Deşe : " + subTotal5);
				iv_scope.getView().byId("subTotal6").setText("Toplam Trim Deşesi : " + subTotal6);
			},

			handleRefresh: function (oEvent) {
				this.getInitialDatas();
			},

			onOverflowToolbarPress: function () {
				var oPanel = this.byId("expandablePanel");
				oPanel.setExpanded(!oPanel.getExpanded());
			},

			onPressCleanFilter: function () {
				this.getView().byId("INP1").setValue("");
				this.getView().byId("INP2").setValue("");
				this.getView().byId("INP3").setValue("");
				this.getView().byId("INP4").setValue("");
				this.getView().byId("INP5").setValue("");
				this.getView().byId("INP6").setValue("");
				this.getView().byId("INP7").setValue(null);
				this.getView().byId("INP8").setSelectedKey("");
				this.getView().byId("INP9").setSelectedKey("");
				this.getInitialDatas();
			},
			onPressDeleteConfirmation:function(){

				var selectedContextPath = this.getView()
				.byId("idInventoryListTable")
				.getSelectedContextPaths("rows");
			var selectedLine = this.getView()
				.byId("idInventoryListTable")
				.getModel()
				.getObject(selectedContextPath[0]);

			if (selectedLine == null || selectedLine == "") {
				MessageBox.error("Lütfen tablodan saçır seçiniz!");
				return;
			}

			var selectedBobinID = selectedLine.SFC ; 
			var selectedShopOrder = selectedLine.SHOP_ORDER;

				if (!this.oApproveDialog) {
                    this.oApproveDialog = new Dialog({
                        type: DialogType.Message,
                        title: "Confirm",
                        content: new Text({ id:"dialogTextID", text: selectedBobinID + " bobin ve ilişkili bobin grubu için teyit iptali yapmak istediğinize emin misiniz?" }),
                        beginButton: new Button({
                            type: ButtonType.Emphasized,
                            text: "Submit",
                            press: function () {
                              
								this.cancelConfirmation(selectedBobinID,selectedShopOrder);

                                this.oApproveDialog.close();
                            }.bind(this),
                        }),
                        endButton: new Button({
                            text: "Cancel",
                            press: function () {
                                this.oApproveDialog.close();
                            }.bind(this),
                        }),
                    });
                }

                this.oApproveDialog.open();
				sap.ui.getCore().byId("dialogTextID").setText(selectedBobinID + " bobin ve ilişkili bobin grubu için teyit iptali yapmak istediğinize emin misiniz?" );

			},


			cancelConfirmation:function(selectedBobinID,selectedShopOrder){
				this.showBusyIndicator(5000, 0);

				TransactionCaller.async("ECZ_MES-4.0/KAGIT/DM_MANAGEMENT/COMBINE_ORDER/combineConfEditCancel/mainTransaction/T_MainTransactionCombineOrderCancelEdit", {
					I_INV: selectedBobinID,
					I_SHOP_ORDER: selectedShopOrder,
				
				},
				"O_JSON",
				this.cancelConfirmationCB,
				this,
				"GET"
			);
			
			},

			cancelConfirmationCB: function(iv_data, iv_scope){
				if(iv_data[1] == "E"){
					MessageBox.show(iv_data[0]);
					return;
				}else{
					MessageBox.show(iv_data[0]);
				iv_scope.getInitialDatas();

				}

			},
			onPressSearchFilter: function () {
				this.getInitialDatas();
			},

			navBack: function () {
				oRouter.navTo("RouteMain", {})
			},

			onPressQualityResults: function (oEvent) {
				var selectedContextPath = this.getView()
					.byId("idInventoryListTable")
					.getSelectedContextPaths("rows");
				var selectedLine = this.getView()
					.byId("idInventoryListTable")
					.getModel()
					.getObject(selectedContextPath[0]);

				if (selectedLine == null || selectedLine == "") {
					MessageBox.error("Lütfen tablodan saçır seçiniz!");
				} else {
					oRouter.navTo("RouteMain4", {
						batchNo: selectedLine.SFC,
						operationNo: "0010",
						selectedParentSfc: selectedParentSfc
					});
				}
			},
			showBusyIndicator : function (iDuration, iDelay) {
				BusyIndicator.show(iDelay);
	
				if (iDuration && iDuration > 0) {
					if (this._sTimeoutId) {
						clearTimeout(this._sTimeoutId);
						this._sTimeoutId = null;
					}
	
					this._sTimeoutId = setTimeout(function() {
						this.hideBusyIndicator();
					}.bind(this), iDuration);
				}
			},
	
			hideBusyIndicator : function() {
				BusyIndicator.hide();
			},


            onPressBobbinStatusChange:function(){
                var selectedContextPath = this.getView()
				.byId("idInventoryListTable")
				.getSelectedContextPaths("rows");
			var selectedLine = this.getView()
				.byId("idInventoryListTable")
				.getModel()
				.getObject(selectedContextPath[0]);

			if (selectedLine == null || selectedLine == "") {
				MessageBox.error("Lütfen tablodan saçır seçiniz!");
				return;
			}

			var selectedBobinID = selectedLine.SFC ; 
            }

		});
	}
);