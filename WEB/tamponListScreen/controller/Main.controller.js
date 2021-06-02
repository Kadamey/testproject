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
		"tamponListScreen/scripts/transactionCaller",
		"sap/m/PDFViewer",
		"sap/ui/core/BusyIndicator",
		"sap/m/Dialog",
		"sap/m/DialogType",
		"sap/m/Button",
		"sap/m/ButtonType"

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
		PDFViewer,
		BusyIndicator,
		Dialog,
		DialogType,
		Button,
		ButtonType
	) {
		"use strict";
		var that, sPath, myModel, tableModel, SFC, oRouter, OPERATION, WorkCenter, SITE;
		let frgData;

		return Controller.extend("tamponListScreen.controller.Main", {
			onInit: function () {
				oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				SITE = jQuery.sap.getUriParameters().get("SITE");

				SFC = jQuery.sap.getUriParameters().get("SFC");
				if (SFC == null || SFC == "") {
					MessageBox.error("Lütfen listeden Sipariş Numarasını seçiniz");
					return;
				}

				OPERATION = jQuery.sap.getUriParameters().get("OPERATION");
				if (OPERATION == null || OPERATION == "") {
					MessageBox.error("Lütfen listeden Operasyon Numarasını seçiniz");
					return;
				}

				this._urlParams = [
					"ACTIVITY_ID",
					"FORM_ID",
					"LOGON",
					"OPERATION",
					"POD_REQUEST",
					"RESOURCE",
					"SFC",
					"SITE",
					"WORKSTATION",
					"WPMF_LEGACY_PLUGIN",
				];
				this._pdfViewer = new PDFViewer();
				this.getView().addDependent(this._pdfViewer);
				//this.getBarcodeColumnVisible();

				var Resource = jQuery.sap.getUriParameters().get("RESOURCE");
				var parts = Resource.split('_');
				WorkCenter = parts[parts.length - 1];
				this.dateFilter = new Date().toLocaleDateString();
				this.timeFilter;
				var hour = new Date().getHours();
				if (hour < 8) {
					this.timeFilter = "1";
				} else if (hour >= 8 && hour < 16) {
					this.timeFilter = "2";
				} else {
					this.timeFilter = "3";
				}

				this.getInitialDatas(WorkCenter, this.dateFilter, this.timeFilter);
			},

			//Filtre Seçenekleri panelini açıp kapatan fonksiyon
			onOverflowToolbarPress: function (oEvent) {
				var oPanel = this.byId("expandablePanel");
				oPanel.setExpanded(!oPanel.getExpanded());
			},

			// getBarcodeColumnVisible: function () {

			//     TransactionCaller.async(
			//         "ECZ_MES-4.0/KAGIT/INVENTORY_LIST/T_GetProdType", {
			//         I_SFC: SFC,
			//     },
			//         "O_JSON",
			//         this.getBarcodeColumnVisibleCB,
			//         this,
			//         "GET"
			//     );

			// },

			// getBarcodeColumnVisibleCB: function (iv_data, iv_scope) {

			//     var prodType = iv_data[0];

			//     if (prodType == "004") {

			//         iv_scope.getView().byId("idInventoryListTable").getColumns()[12].setVisible(true);

			//     }

			// },

			onPressSearchFilter: function () {

				this.dateFilter = "",
					this.timeFilter = "";
				if (this.getView().byId("INP7").getDateValue() != null) {
					this.dateFilter = this.getView().byId("INP7").getDateValue().toLocaleDateString();
				}

				if (this.getView().byId("INP8").getSelectedKey() != "") {
					if (this.getView().byId("INP7").getDateValue() == null) {
						MessageToast.show("Lütfen geçerli bir tarih girişi yapınız");
						return;
					} else {
						this.timeFilter = this.getView().byId("INP8").getSelectedKey();
						this.getInitialDatas(WorkCenter, this.dateFilter, this.timeFilter);
					}
				}

			},

			getInitialDatas: function (WorkCenter, dateFilter, timeFilter) {

				TransactionCaller.async(
					"ECZ_MES-4.0/KAGIT/INVENTORY_LIST/T_GetInventoryListFromSfc",
					// "ECZ_MES-4.0/KAGIT/INVENTORY_LIST/T_GetInventoryListFromSfc_withTimeFilter",
					{
						I_SFC: SFC,
						I_WORKCENTER: WorkCenter,
						I_DATE: dateFilter,
						I_SHIFT: timeFilter
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
					iv_scope.setTotalValues(myModel);
				} else if (!iv_data[0]?.Rowsets?.Rowset?.Row) {
					myModel.setData(null);
				} else {
					var obj_iv_data = iv_data[0];
					var dummyData = [];
					dummyData.push(iv_data[0].Rowsets.Rowset.Row);
					obj_iv_data.Rowsets.Rowset.Row = dummyData;
					myModel.setData(obj_iv_data);
					iv_scope.setTotalValues(myModel);
				}

				iv_scope.getView().byId("idInventoryListTable").setModel(myModel);
			},

			setTotalValues: function (myModel) {
				var totalTampon = myModel.getData().Rowsets.Rowset.Row.length;
				var totalTrim = "0";
				var production = "0";
				var totalQualityScrap = "0";
				var totalOtherScrap = "0";
				//var tableLength=myModel.getData().Rowsets.Rowset.Row.length;

				for (var i = 0; i < totalTampon; i++) {
					totalTrim = parseFloat(totalTrim) + parseFloat(myModel.getData().Rowsets.Rowset.Row[i].NC_GROUP003);
					totalOtherScrap = parseFloat(totalOtherScrap) + parseFloat(myModel.getData().Rowsets.Rowset.Row[i].NC_GROUP002);
					totalQualityScrap = parseFloat(totalQualityScrap) + parseFloat(myModel.getData().Rowsets.Rowset.Row[i].NC_GROUP001);
					production = parseFloat(production) + parseFloat(parseFloat(myModel.getData().Rowsets.Rowset.Row[i].ORIGINAL_QTY2));
				}
				this.getView().byId("sumTampon").setText(totalTampon);
				this.getView().byId("sumProd").setText(production);
				this.getView().byId("sumScrapQuality").setText(totalQualityScrap);
				this.getView().byId("sumOtherScrap").setText(totalOtherScrap);
				this.getView().byId("sumTrimScrap").setText(totalTrim);

			},

			//malzeme dönüştür yetki için eklendi.

			onPressMovementButton: function () {

				var response = TransactionCaller.async(
					"ECZ_MES-4.0/KAGIT/TAMPON_LIST/T_AuthorityControlBobbinList", {
						I_SITE: SITE
					},
					"O_JSON",
					this.onPressMovementButtonCB,
					this,
					"GET"
				);

			},

			onPressMovementButtonCB(iv_data, iv_scope) {

				if (iv_data[1] == "S") {

					iv_scope.onPressMaterialMovement();

				} else {
					var msg = iv_data[0];
					MessageToast.show(msg);
				}
					
			},

			onPressMaterialMovement: function () {
				var selectedContextPath = this.getView()
					.byId("idInventoryListTable")
					.getSelectedContextPaths("rows");
				var selectedLine = this.getView()
					.byId("idInventoryListTable")
					.getModel()
					.getObject(selectedContextPath[0]);

				if (selectedLine == null) {
					MessageBox.error("Lütfen tablodan satır seçiniz!");
					return;
				}
				
				if (!this.materialMovementFragment) {
					this.materialMovementFragment = sap.ui.xmlfragment(
						"Z_MaterialMovement",
						"tamponListScreen.view.fragments.materialMovementDialog",
						this
					);
					this.getView().addDependent(this.materialMovementFragment);
				}

				this.getBobinMaterialsData();

				this.materialMovementFragment.open();
				sap.ui.core.Fragment.byId(
					"Z_MaterialMovement",
					"materialNoFieldId"
				).setValue(selectedLine.MATERIAL);
				sap.ui.core.Fragment.byId(
					"Z_MaterialMovement",
					"batchFieldId"
				).setValue(selectedLine.SFC);
				sap.ui.core.Fragment.byId(
					"Z_MaterialMovement",
					"storageLocationFieldId"
				).setValue(selectedLine.STORAGE_LOCATION);
				sap.ui.core.Fragment.byId("Z_MaterialMovement", "quantity").setValue(
					selectedLine.ORIGINAL_QTY
				);
			},

			getBobinMaterialsData: function () {
				TransactionCaller.async(
					"ECZ_MES-4.0/KAGIT/TAMPON_LIST/setTamponMaterials", {},
					"O_JSON",
					this.getBobinMaterialsDataCB,
					this,
					"GET", {}
				);
			},
			getBobinMaterialsDataCB: function (iv_data, iv_scope) {
				var myModel = new sap.ui.model.json.JSONModel();

				if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
					myModel.setData(iv_data[0]);
				} else {
					var obj_iv_data = iv_data[0];
					var dummyData = [];
					dummyData.push(iv_data[0].Rowsets.Rowset.Row);
					obj_iv_data.Rowsets.Rowset.Row = dummyData;
					myModel.setData(obj_iv_data);
				}
				//myModel.refresh();

				sap.ui.core.Fragment.byId(
					"Z_MaterialMovement",
					"newMaterialNumber"
				).setModel(myModel);

				// iv_scope.getView().byId("idUsageDeciTable").setModel(tableModel);
			},

			onPressCancel: function (oEvent) {
				this.materialMovementFragment.close();
			},

			onPressSaveButton: function (oEvent) {

				var materialNo = sap.ui.core.Fragment.byId(
					"Z_MaterialMovement",
					"materialNoFieldId"
				).getValue();

				var moveMaterial = sap.ui.core.Fragment.byId(
					"Z_MaterialMovement",
					"newMaterialNumber"
				).getValue();
				if (moveMaterial == "") {

					var msg = "Lütfen malzeme numarası seçiniz."

					MessageToast.show(msg);

				} else {
					jQuery.sap.require("sap.m.MessageBox");

					sap.m.MessageBox.show(
						materialNo + " No'lu malzeme " + moveMaterial + " No'lu malzemeye dönüştürülecektir.Onaylıyor musunuz?", {
							icon: sap.m.MessageBox.Icon.WARNING,
							title: "UYARI",
							actions: [
								sap.m.MessageBox.Action.OK,
								sap.m.MessageBox.Action.CANCEL,
							],
							onClose: function (oAction) {
								if (oAction == "OK") {
									this.onSaveMaterialTransformation(materialNo, moveMaterial);
								}
							}.bind(this),
						}
					);
				}

			},

			onSaveMaterialTransformation: function (materialNo, moveMaterial) {

				var materialBatchNo = sap.ui.core.Fragment.byId(
					"Z_MaterialMovement",
					"batchFieldId"
				).getValue();
				var storageLocation = sap.ui.core.Fragment.byId(
					"Z_MaterialMovement",
					"storageLocationFieldId"
				).getValue();

				var quantity = sap.ui.core.Fragment.byId(
					"Z_MaterialMovement",
					"quantity"
				).getValue();

				var response = TransactionCaller.sync(
					"ECZ_MES-4.0/MATERIAL_MOVEMENT/T_GoodsMovement", {
						I_BatchNumber: materialBatchNo,
						I_MaterialNumber: materialNo,
						I_MatStrLoc: storageLocation,
						I_MoveMaterial: moveMaterial,
						I_Quantity: quantity / 1000,
						I_SITE: SITE
					},
					"O_JSON"
				);

				if (response[1] == "E") {
					MessageBox.error("Hata mesaji: " + response[0]);
				} else {
					this.onPressCancel();
				}

			},

			onEditInventory: function (oEvent) {
				var baseURL = "/XMII/CM/ECZ_MES-4.0/addTamponScreen/index.html?";
				this._urlParams.forEach((item) => {
					var val = jQuery.sap.getUriParameters().get(item);
					if (!!val) {
						baseURL += "&" + item + "=" + val;
					}
				}, this);

				//secilen satırı bulma
				var sIndex = oEvent.getSource().getBindingContext().sPath.split("/")[4];
				var selectedTampon = oEvent.getSource().getBindingContext().getModel().getData().Rowsets.Rowset.Row[sIndex].SFC;
				//  var meConfCount = oEvent.getSource().getBindingContext().getModel().getData().Rowsets.Rowset.Row[sIndex].ME_CONF_COUNT;
				baseURL += "&" + "TAMPON_ID" + "=" + selectedTampon;
				// baseURL += "&" + "ME_CONF_COUNT" + "=" + meConfCount;

				window.open(baseURL, "tamponCreate", "width=1000px,height=1500px");
			},

			onDeleteDecision: function (oEvent) {

				var sBinding = this.getView()
					.byId("idInventoryListTable").getSelectedContextPaths();

				var selectedRow = this.getView()
					.byId("idInventoryListTable").getModel().getObject(sBinding[0]);

				if (selectedRow == null) {
					MessageBox.error("Lütfen tablodan satır seçiniz!");
					return;
				}

				var quantity = selectedRow.QTY_ON_HAND;
				//   var meConfCount = selectedRow.ME_CONF_COUNT;
				var tamponId = selectedRow.SFC;
				this.getConfirmationCancel(tamponId);

			},

			getConfirmationCancel: function (tamponId) {

				if (!this.oApproveDialog2) {
					this.oApproveDialog2 = new Dialog({
						type: DialogType.Message,
						title: "Uyarı",
						content: new sap.m.Label({
							text: "Tampon silme işlemini yapmak istediğinize emin misiniz?",
						}),
						beginButton: new Button({
							type: ButtonType.Emphasized,
							text: "Onayla",
							press: function () {
								this.showBusyIndicator(10000, 0);

								TransactionCaller.async(
									"ECZ_MES-4.0/KAGIT/TAMPON_EDIT_CANCEL/mainTransaction/T_MainTransactionTamponCancelEdit", {

										I_INV: tamponId,
										I_SITE: SITE
									},
									"O_JSON",
									this.getConfirmationCancelCB,
									this,
									"GET"
								);
								//  MessageToast.show("Submit pressed!");
								this.oApproveDialog2.close();
								return;
							}.bind(this),
						}),
						endButton: new Button({
							text: "İptal",
							press: function () {
								this.oApproveDialog2.close();
							}.bind(this),
						}),
					});
				}

				this.oApproveDialog2.open();
				//this.showBusyIndicator(10000, 0);

			},

			getConfirmationCancelCB: function (iv_data, iv_scope) {

				var msg;

				if (iv_data[1] == "E") {
					msg = iv_data[0];
				} else {
					msg = iv_data[0];
				}

				MessageToast.show(msg);
				iv_scope.getInitialDatas(WorkCenter, iv_scope.dateFilter, iv_scope.timeFilter);
				//   setTimeout(function () { iv_scope.getInitialDatas(); }, 17000);

			},

			onPressBarcodeButton: function (oEvent) {

				var rowId = oEvent.getSource().getParent().getId().split("-")[7];
				var selectedRow = this.getView()
					.byId("idInventoryListTable").getModel().getData().Rowsets.Rowset.Row[rowId];

				TransactionCaller.async(
					"ECZ_MES-4.0/PRINTING/T_Paletetiket", {
						I_MATERIAL: selectedRow.MATERIAL,
						I_BATCH: selectedRow.SFC,
					},
					"O_JSON",
					this.onPressBarcodeButtonCB,
					this,
					"GET"
				);

			},

			onPressBarcodeButtonCB: function (iv_data, iv_scope) {

				var base64EncodedPDF = iv_data[0].Result.value; // the encoded string
				var decodedPdfContent = atob(base64EncodedPDF);
				var byteArray = new Uint8Array(decodedPdfContent.length)
				for (var i = 0; i < decodedPdfContent.length; i++) {
					byteArray[i] = decodedPdfContent.charCodeAt(i);
				}
				var blob = new Blob([byteArray.buffer], {
					type: 'application/pdf'
				});
				var _pdfurl = URL.createObjectURL(blob);
				jQuery.sap.addUrlWhitelist("blob");

				iv_scope._pdfViewer.setSource(_pdfurl);
				iv_scope._pdfViewer.setTitle("Çubuk Barkod");
				iv_scope._pdfViewer.open();

			},

			onPressCleanFilter: function () {
				this.getView().byId("INP7").setValue(null);
				this.getView().byId("INP8").setSelectedKey("");
				this.getInitialDatas();
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
					if (OPERATION == null || OPERATION == "") {
						MessageBox.error("Lütfen listeden operasyon numarası seçiniz!");
					} else {
						oRouter.navTo("RouteMain2", {
							batchNo: selectedLine.SFC,
							operationNo: OPERATION,
						});
					}
				}
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
			},

		});
	}
);