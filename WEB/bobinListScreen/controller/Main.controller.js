sap.ui.define(
	[
		"jquery.sap.global",
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/core/Fragment",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/export/library",
		"sap/ui/export/Spreadsheet",
		"bobinListScreen/scripts/transactionCaller",
		"sap/ui/core/BusyIndicator"
	],
	function (
		jQuery,
		Controller,
		JSONModel,
		MessageToast,
		MessageBox,
		Fragment,
		Filter,
		FilterOperator,
		exportLibrary,
		Spreadsheet,
		TransactionCaller,
		BusyIndicator
	) {
		"use strict";
		var SFC, RESOURCE, SITE;

		return Controller.extend("bobinListScreen.controller.Main", {
			onInit: function () {
				SFC = jQuery.sap.getUriParameters().get("SFC");
				RESOURCE = jQuery.sap.getUriParameters().get("RESOURCE")?.replace("RES_", "");
				SITE = jQuery.sap.getUriParameters().get("SITE");
				this.getAllLines();
			},

			getAllLines: function (oEvent) {
				TransactionCaller.async("ECZ_MES-4.0/KONVERTING/stoppageScreen/T_GET_WCS", {
						I_SITE: SITE,
					},
					"O_JSON",
					this.getAllLinesCB,
					this,
					"GET"
				);
			},

			getAllLinesCB: function (iv_data, iv_scope) {
				var myModel = new sap.ui.model.json.JSONModel();
				myModel.setData(iv_data[0].serviceInvocationResponses.serviceInvocationResponse.responses);
				iv_scope.getView().byId("idWcsComboBox").setModel(myModel);
				iv_scope.getView().byId("idWcsComboBox").setSelectedKey(RESOURCE);
				iv_scope.getInitialDatas();
			},

			getInitialDatas: function (oEvent) {
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

				TransactionCaller.async("ECZ_MES-4.0/KONVERTING/bobbinListScreen/getBobinList/T_GET_INV", {
						I_WORKCENTER: this.getView().byId("idWcsComboBox").getSelectedKey(),
						I_FILTER1: this.getView().byId("INP1").getValue(),
						I_FILTER2: this.getView().byId("INP2").getValue(),
						I_FILTER3: this.getView().byId("INP3").getValue(),
						I_FILTER4: this.getView().byId("INP4").getValue(),
						I_FILTER5: this.getView().byId("INP5").getValue(),
						I_FILTER6: this.getView().byId("INP6").getSelectedKey(),
						I_FILTER7: dateFilter,
						I_FILTER8: timeFilter,
						I_FILTER9: this.getView().byId("INP9").getSelectedKey(),
						I_SITE: SITE,
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
				iv_scope.getRowColor();
				iv_scope.getView().byId("idInventoryListTable").getModel().refresh();

				var subTotal1 = 0,
					subTotal2 = 0,
					subTotal3 = 0,
					subTotal4 = 0,
					subTotal5 = 0;
				for (var i = 0; i < myModel.getData()?.Rowsets?.Rowset?.Row?.length; i++) {
					subTotal1 = subTotal1 + Number(myModel.getData().Rowsets.Rowset.Row[i].ORIGINAL_QTY);
					subTotal2 = subTotal2 + Number(myModel.getData().Rowsets.Rowset.Row[i].QTY_LAST_REMAINING);
					subTotal3 = subTotal3 + Number(myModel.getData().Rowsets.Rowset.Row[i].QTY_ON_HANDS);
					if (myModel.getData().Rowsets.Rowset.Row[i].CONSUMEDQTY == "---") {
						subTotal4 = subTotal4 + 0;
					} else {
						subTotal4 = subTotal4 + Number(myModel.getData().Rowsets.Rowset.Row[i].CONSUMEDQTY);
					}
					if (myModel.getData().Rowsets.Rowset.Row[i].TOTALSCRAPT == "NA") {
						subTotal5 = subTotal5 + 0;
					} else {
						subTotal5 = subTotal5 + Number(myModel.getData().Rowsets.Rowset.Row[i].TOTALSCRAPT);
					}
				}

				iv_scope.getView().byId("subTotal1").setText("Top. Yarı Ürün Miktarı : " + subTotal1);
				iv_scope.getView().byId("subTotal2").setText("Top. Üretime Giren Miktar : " + subTotal2);
				iv_scope.getView().byId("subTotal3").setText("Top. Kalan Miktar : " + subTotal3);
				iv_scope.getView().byId("subTotal4").setText("Top. Tüketilen Miktar : " + subTotal4);
				iv_scope.getView().byId("subTotal5").setText("Top. Deşe Miktarı : " + subTotal5);
			},

			handleRefresh: function (oEvent) {
				this.getInitialDatas();
			},

			getRowColor: function () {
				var tableRowDeatils = this.getView().byId("idInventoryListTable").getModel().oData?.Rowsets?.Rowset?.Row;
				var length = this.getView().byId("idInventoryListTable").getModel().oData?.Rowsets?.Rowset?.Row?.length;
				var tableItems = this.getView().byId("idInventoryListTable").getItems();

				for (var j = 0; j < length; j++) {
					tableItems[j].removeStyleClass("redBackground");
					tableItems[j].removeStyleClass("yellowBackground");
					tableItems[j].removeStyleClass("greenBackground");

					if (this.getView().byId("idInventoryListTable").getModel().oData.Rowsets.Rowset.Row[j].QTY_ON_HANDS == "0") {
						tableItems[j].addStyleClass("redBackground");
					} else if (this.getView().byId("idInventoryListTable").getModel().oData.Rowsets.Rowset.Row[j].INV_STATUS == "UYGUN" && this.getView()
						.byId("idInventoryListTable").getModel().oData.Rowsets.Rowset.Row[j].RESOURCE != null) {
						tableItems[j].addStyleClass("greenBackground");
					} else if (this.getView().byId("idInventoryListTable").getModel().oData.Rowsets.Rowset.Row[j].INV_STATUS == "STD.DIŞI") {
						tableItems[j].addStyleClass("yellowBackground");
					}
				}
			},

			// Deşe kaydet yetki kontrolü

			onPressScraptButton: function () {

				var response = TransactionCaller.async(
					"ECZ_MES-4.0/KONVERTING/bobbinListScreen/T_ AuthorityControl_konv", {
						I_SITE: SITE
					},
					"O_JSON",
					this.onPressScraptButtonCB,
					this,
					"GET"
				);

			},

			onPressScraptButtonCB(iv_data, iv_scope) {

				if (iv_data[1] == "S") {

					iv_scope.onPressGiveScraptButton();

				} else {
					var msg = iv_data[0];
					MessageToast.show(msg);
				}
			},

			onPressGiveScraptButton: function (oEvent) {
				this.fragmentStatus = "onPressGiveScraptButton";

				var path = this.getView().byId("idInventoryListTable").getSelectedContextPaths()[0];
				if (path == undefined) {
					MessageBox.error("Lütfen tablodan seçim yapınız");
					return;
				}
				var selectedLine = this.byId("idInventoryListTable").getModel().getProperty(path);

				if (!this.addScraptFragment) {
					this.addScraptFragment = sap.ui.xmlfragment("Z_GiveScraptForBobbin", "bobinListScreen.view.fragments.961MovementFragment", this);
					this.getView().addDependent(this.addScraptFragment);
				}

				this.addScraptFragment.open();
				this.screenVisibility();

				var response = TransactionCaller.sync(
					"ECZ_MES-4.0/KONVERTING/bobbinListScreen/getDepartmentandCostCenters/T_GetDepartmentAndCostCentersKonverting", {
						I_SITE: SITE,
					},
					"O_JSON"
				);

				var myModel = new sap.ui.model.json.JSONModel();
				myModel.setData(response[0].Result);

				var wcsFrgment = selectedLine.REPORTING_CENTER_BO;
				var splittedWCS = wcsFrgment.split(",")[1];
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "fragmentBilletAdd").setTitle("Dese Girişi");
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "fragmentBilletAdd").setState("Success");
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "bobinNoFieldId").setModel(myModel);
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "departmentFieldId").setModel(myModel);
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "ncCodeFieldId").setModel(myModel);
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "materialNoFieldId").setValue(selectedLine.ITEM_INVENTORY);
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "batchFieldId").setValue(selectedLine.INVENTORY_ID);
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "batchFieldId2").setValue(selectedLine.BATCH_ID);
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "storageLocationFieldId").setValue(selectedLine.STORAGE_LOCATION_BO);
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "bobinNoFieldId").setValue(selectedLine.INVENTORY_ID);
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "bobinNoFieldId2").setValue(selectedLine.BATCH_ID);
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "MachineFieldId").setValue(splittedWCS);
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "quantitiyFieldId").setValue("");
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "meInventoryId").setValue(selectedLine.BATCH_ID);
			},

			//onPressGiveStockReturnButton yetki ekleme için eklendi.

			onPressStockReturnButton: function () {

				var response = TransactionCaller.async(
					"ECZ_MES-4.0/KONVERTING/bobbinListScreen/T_ AuthorityControl_konv", {
						I_SITE: SITE
					},
					"O_JSON",
					this.onPressStockReturnButtonCB,
					this,
					"GET"
				);

			},

			onPressStockReturnButtonCB(iv_data, iv_scope) {

				if (iv_data[1] == "S") {

					iv_scope.onPressGiveStockReturnButton();

				} else {
					var msg = iv_data[0];
					MessageToast.show(msg);
				}
			},

			onPressGiveStockReturnButton: function (oEvent) {
				this.fragmentStatus = "onPressGiveStockReturnButton";

				var path = this.getView().byId("idInventoryListTable").getSelectedContextPaths()[0];
				if (path == undefined) {
					MessageBox.error("Lütfen tablodan seçim yapınız");
					return;
				}
				var selectedLine = this.byId("idInventoryListTable").getModel().getProperty(path);

				if (!this.addScraptFragment) {
					this.addScraptFragment = sap.ui.xmlfragment("Z_GiveScraptForBobbin", "bobinListScreen.view.fragments.961MovementFragment", this);
					this.getView().addDependent(this.addScraptFragment);
				}

				this.addScraptFragment.open();
				this.screenVisibility();

				var wcsFrgment = selectedLine.REPORTING_CENTER_BO;
				var splittedWCS = wcsFrgment.split(",")[1];
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "fragmentBilletAdd").setTitle("Stok İade");
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "fragmentBilletAdd").setState("Warning");
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "materialNoFieldId").setValue(selectedLine.ITEM_INVENTORY);
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "batchFieldId").setValue(selectedLine.INVENTORY_ID);
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "batchFieldId2").setValue(selectedLine.BATCH_ID);
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "storageLocationFieldId").setValue(selectedLine.STORAGE_LOCATION_BO);
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "quantitiyFieldId").setValue(selectedLine.QTY_ON_HANDS);
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "bobinNoFieldId").setValue(selectedLine.INVENTORY_ID);
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "bobinNoFieldId2").setValue(selectedLine.BATCH_ID);
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "MachineFieldId").setValue(splittedWCS);
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "meInventoryId").setValue(selectedLine.BATCH_ID);
			},

			// Standard dışına ayır yetkilendirme için eklendi.

			onPressBlockAuthorityButton: function () {

				var response = TransactionCaller.async(
					"ECZ_MES-4.0/KONVERTING/bobbinListScreen/T_ AuthorityControl_konv", {
						I_SITE: SITE
					},
					"O_JSON",
					this.onPressBlockAuthorityButtonCB,
					this,
					"GET"
				);

			},

			onPressBlockAuthorityButtonCB(iv_data, iv_scope) {

				if (iv_data[1] == "S") {

					iv_scope.onPressBlockButton();

				} else {
					var msg = iv_data[0];
					MessageToast.show(msg);
				}
			},

			onPressBlockButton: function (oEvent) {
				this.fragmentStatus = "onPressBlockButton";

				var path = this.getView().byId("idInventoryListTable").getSelectedContextPaths()[0];
				if (path == undefined) {
					MessageBox.error("Lütfen tablodan seçim yapınız");
					return;
				}
				var selectedLine = this.byId("idInventoryListTable").getModel().getProperty(path);

				if (selectedLine.QTY_ON_HANDS == "0") {
					MessageBox.error("Kalan miktarı 0 olan bir bobin blokeye ayrılamaz.");
					return;
				}

				if (!this.addScraptFragment) {
					this.addScraptFragment = sap.ui.xmlfragment("Z_GiveScraptForBobbin", "bobinListScreen.view.fragments.961MovementFragment", this);
					this.getView().addDependent(this.addScraptFragment);
				}

				this.addScraptFragment.open();
				this.screenVisibility();

				var wcsFrgment = selectedLine.REPORTING_CENTER_BO;
				var splittedWCS = wcsFrgment.split(",")[1];
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "fragmentBilletAdd").setTitle("Blokeye Ayır");
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "fragmentBilletAdd").setState("Error");
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "materialNoFieldId").setValue(selectedLine.ITEM_INVENTORY);
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "batchFieldId").setValue(selectedLine.INVENTORY_ID);
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "batchFieldId2").setValue(selectedLine.BATCH_ID);
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "storageLocationFieldId").setValue(selectedLine.STORAGE_LOCATION_BO);
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "quantitiyFieldId").setValue(selectedLine.QTY_ON_HANDS);
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "bobinNoFieldId").setValue(selectedLine.INVENTORY_ID);
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "bobinNoFieldId2").setValue(selectedLine.BATCH_ID);
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "MachineFieldId").setValue(splittedWCS);
				sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "meInventoryId").setValue(selectedLine.BATCH_ID);
			},

			// Deşe detay butonu yetki için eklendi.
			onPressDetailButton: function () {

				var response = TransactionCaller.async(
					"ECZ_MES-4.0/KONVERTING/bobbinListScreen/T_ AuthorityControl_konv", {
						I_SITE: SITE
					},
					"O_JSON",
					this.onPressDetailButtonCB,
					this,
					"GET"
				);

			},

			onPressDetailButtonCB(iv_data, iv_scope) {

				if (iv_data[1] == "S") {

					iv_scope.onPressDetailsButton();

				} else {
					var msg = iv_data[0];
					MessageToast.show(msg);
				}
			},

			onPressDetailsButton: function () {
				var path = this.getView().byId("idInventoryListTable").getSelectedContextPaths()[0];
				if (path == undefined) {
					MessageBox.error("Lütfen tablodan seçim yapınız");
					return;
				}
				var selectedLine = this.byId("idInventoryListTable").getModel().getProperty(path);
				var batchNo = selectedLine.INVENTORY_ID;

				if (!this.detailScraptFragment) {
					this.detailScraptFragment = sap.ui.xmlfragment("Z_DetailScraptForBobbin",
						"bobinListScreen.view.fragments.bobinDeseDetailsFragment", this);
					this.getView().addDependent(this.detailScraptFragment);
				}

				TransactionCaller.async("ECZ_MES-4.0/KONVERTING/bobbinListScreen/getBobinList/T_GetNcCodesDetailsFromBobinId", {
						I_INV: batchNo,
					},
					"O_JSON",
					this.onPressDetailsButtonCB,
					this,
					"GET"
				);

				this.detailScraptFragment.open();
			},

			onPressDetailsButtonCB: function (iv_data, iv_scope) {
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

				sap.ui.core.Fragment.byId("Z_DetailScraptForBobbin", "idBobinDeseDetailsTable").setModel(myModel);
			},

			onPressCancelScrapt: function (oEvent) {
				if (this.addScraptFragment) {
					this.addScraptFragment.close();
				}

				if (this.detailScraptFragment) {
					this.detailScraptFragment.close();
				}
			},

			onPressSaveScrapt: function (oEvent) {

				this.showBusyIndicator(5000, 0);
				var material = sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "materialNoFieldId").getValue();
				var batchNo = sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "batchFieldId").getValue();
				var storageLocation = sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "storageLocationFieldId").getValue();
				var quantityField = sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "quantitiyFieldId").getValue();
				var meInventoryId = sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "meInventoryId").getValue();

				if (this.fragmentStatus == "onPressGiveScraptButton") {
					var ncCodeCostCenter = sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "departmentFieldId").getSelectedKey();
					var ncCodeReasonCode = sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "ncCodeFieldId").getSelectedKey();

					var jsonDataforInputs = [];
					jsonDataforInputs.push({
						parentScraptType: ncCodeCostCenter,
						childScraptType: ncCodeReasonCode,
						quantity: quantityField
					});

					TransactionCaller.async("ECZ_MES-4.0/KONVERTING/bobbinListScreen/961movement/T_MainTransactionFor961Movement", {
							I_BATCH: batchNo,
							I_MATERIAL: material,
							I_QUANTITY: Number(quantityField),
							I_STORAGE_LOC: storageLocation,
							I_DATA: JSON.stringify(jsonDataforInputs),
							I_ME_INVENTORY_ID: meInventoryId,
							I_SITE: SITE,
							I_WORKCENTER: this.getView().byId("idWcsComboBox").getSelectedKey()
						},
						"O_JSON",
						this.onPressSaveScraptCB,
						this,
						"GET"
					);

				} else if (this.fragmentStatus == "onPressBlockButton") {
					TransactionCaller.async(
						"ECZ_MES-4.0/KONVERTING/bobbinListScreen/calculationBobinQtyForReturnAndBlock/T_calculationBobinQtyForReturnAndBlock", {
							I_INV: batchNo,
							I_TYPE: "Block",
							I_ME_INVENTORY_ID: meInventoryId,
							I_SITE: SITE,
							I_WORK_CENTER: this.getView().byId("idWcsComboBox").getSelectedKey()
						},
						"O_JSON",
						this.onPressSaveScraptCB,
						this,
						"GET"
					);
				} else if (this.fragmentStatus == "onPressGiveStockReturnButton") {
					TransactionCaller.async(
						"ECZ_MES-4.0/KONVERTING/bobbinListScreen/calculationBobinQtyForReturnAndBlock/T_calculationBobinQtyForReturnAndBlock", {
							I_INV: batchNo,
							I_TYPE: "StockReturn",
							I_ME_INVENTORY_ID: meInventoryId,
							I_SITE: SITE,
							I_WORK_CENTER: this.getView().byId("idWcsComboBox").getSelectedKey()
						},
						"O_JSON",
						this.onPressSaveScraptCB,
						this,
						"GET"
					);
				}
			},

			onPressSaveScraptCB: function (iv_data, iv_scope) {
				if (iv_data[1] == "E") {
					MessageBox.error(iv_data[0]);
				} else {
					MessageToast.show(iv_data[0]);

					iv_scope.addScraptFragment.close();
					iv_scope.getInitialDatas();
				}
			},

			screenVisibility: function () {
				if (this.fragmentStatus == "onPressGiveScraptButton") {
					sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "ncCodeFieldId").setVisible(true);
					sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "ncCodeFieldIdText").setVisible(true);
					sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "departmentFieldId").setVisible(true);
					sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "departmentFieldIdText").setVisible(true);
					sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "quantitiyFieldId").setEditable(true);
				} else if (this.fragmentStatus == "onPressBlockButton" || this.fragmentStatus == "onPressGiveStockReturnButton") {
					sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "ncCodeFieldId").setVisible(false);
					sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "ncCodeFieldIdText").setVisible(false);
					sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "departmentFieldId").setVisible(false);
					sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "departmentFieldIdText").setVisible(false);
					sap.ui.core.Fragment.byId("Z_GiveScraptForBobbin", "quantitiyFieldId").setEditable(false);
				}
			},

			onPressCleanFilter: function () {
				this.getView().byId("INP1").setValue("");
				this.getView().byId("INP2").setValue("");
				this.getView().byId("INP3").setValue("");
				this.getView().byId("INP4").setValue("");
				this.getView().byId("INP5").setValue("");
				this.getView().byId("INP6").setSelectedKey("");
				this.getView().byId("INP7").setValue(null);
				this.getView().byId("INP8").setSelectedKey("");
				this.getView().byId("INP9").setSelectedKey("");
				this.getInitialDatas();
			},

			onPressSearchFilter: function () {
				this.getInitialDatas();
			},

			onOverflowToolbarPress: function () {
				var oPanel = this.byId("expandablePanel");
				oPanel.setExpanded(!oPanel.getExpanded());
			},
			showBusyIndicator: function (iDuration, iDelay) {
				BusyIndicator.show(iDelay);

				if (iDuration && iDuration > 0) {
					if (this._sTimeoutId) {
						clearTimeout(this._sTimeoutId);
						this._sTimeoutId = null;
					}

					this._sTimeoutId = setTimeout(function () {
						this.hideBusyIndicator();
					}.bind(this), iDuration);
				}
			},

			hideBusyIndicator: function () {
				BusyIndicator.hide();
				this.getPackageDetails();
			},

		});
	});