//EDİT
/* global sap,$,_ */
sap.ui.define(
	[
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"orderReleaseScreen/scripts/transactionCaller",
		"orderReleaseScreen/scripts/jspdf",
		"sap/m/Dialog",
		"sap/m/Text",
		"sap/m/TextArea",
		"sap/m/Button",
		"sap/m/DialogType",
		"sap/m/ButtonType",
	],
	function (
		Controller,
		JSONModel,
		MessageToast,
		MessageBox,
		TransactionCaller,
		jspdf,
		Dialog,
		Text,
		TextArea,
		Button,
		DialogType,
		ButtonType
	) {
		"use strict";
		/* jshint -W061 */
		var oRouter;
		var totalSeluloz;
		var totalDese;

		return Controller.extend(
			"orderReleaseScreen.controller.orderDetailsPopupKM",
			(function () {
				var controller;
				var previous;
				var banbury;
				var KMSQC;
				var SFC_STATUS;
				var AUTH_CHECK;

				return {
					onInit: onInit,
					onPressFilterButton: onPressFilterButton,
					getOrderList: getOrderList,
					getOrderListCB: getOrderListCB,
					getAllWCS: getAllWCS,
					getAllWCSCB: getAllWCSCB,
					onOrdersTableSelectionChange: onOrdersTableSelectionChange,
					setDateFunction: setDateFunction,
					onPressOrderDetailButton: onPressOrderDetailButton,
					getDialog1: getDialog1,
					onFragmentCancel: onFragmentCancel,
					onNavBack: onNavBack,
					_fnAttachment: _fnAttachment,
					_fnRouteMatched: _fnRouteMatched,
					_onRoute: _onRoute,
					setDummyData: setDummyData,
					getChemicalDetails: getChemicalDetails,
					getChemicalDetailsCB: getChemicalDetailsCB,
					getHarmanDetails: getHarmanDetails,
					getHarmanDetailsCB: getHarmanDetailsCB,
					onPressharmanEditButton: onPressharmanEditButton,
					onPressharmanSaveButton: onPressharmanSaveButton,
					onPresschemicalEditButton: onPresschemicalEditButton,
					onPresschemicalSaveButton: onPresschemicalSaveButton,
					harmanInputChange: harmanInputChange,
					chemicalInputChange: chemicalInputChange,
					onChemicalTableSelectionChange: onChemicalTableSelectionChange,
					onPressAddSelulozButton: onPressAddSelulozButton,
					onPressSelulozAddButton: onPressSelulozAddButton,
					getAllMaterials: getAllMaterials,
					getAllMaterialsCB: getAllMaterialsCB,
					onConfirmSelulozAddButton: onConfirmSelulozAddButton,
					onConfirmSelulozAddButtonCB: onConfirmSelulozAddButtonCB,
					getSelulozCombinationDetails: getSelulozCombinationDetails,
					getSelulozCombinationDetailsCB: getSelulozCombinationDetailsCB,
					onDataExportPDF: onDataExportPDF,
					onCancelSelulozButton: onCancelSelulozButton,

					onDelete: onDelete,
					getSelulozCombinationDetailsFragmentTable: getSelulozCombinationDetailsFragmentTable,
					getSelulozCombinationDetailsFragmentTableCB: getSelulozCombinationDetailsFragmentTableCB,
					getPairedOrderDatas: getPairedOrderDatas,
					getPairedOrderDatasCB: getPairedOrderDatasCB,
					setPairedDatasToScreen: setPairedDatasToScreen,
					navBack: navBack,
					setVisibleFalse: setVisibleFalse,
					saveEbatButton: saveEbatButton,
					deleteSFC: deleteSFC,
					saveAll: saveAll,
					getTotal: getTotal,
					getTotalDese: getTotalDese,
					setScreenFieldsEditNotEditMode: setScreenFieldsEditNotEditMode,
					onChangeHarmanRatio: onChangeHarmanRatio,
					getKMSQCValues: getKMSQCValues,
					getKMSQCValuesCB: getKMSQCValuesCB,
					getDMSQCValues: getDMSQCValues,
					getDMSQCValuesCB: getDMSQCValuesCB
                    
				};

				var that = this;
				var count;

				function onInit() {
					oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					oRouter
						.getRoute("RouteMain2")
						.attachPatternMatched(this._onRoute, this);
					this.setDummyData();

					//   this.router = sap.ui.core.UIComponent.getRouterFor(this);
					//  this.router.attachRouteMatched(this._fnRouteMatched,this);
					// this.onNavBack();

					// this.setDateFunction();
					//  this.getAllWCS();
				}

				function _onRoute(oEvent) {
					count = 0;
					var WorkCenter = oEvent.getParameter("arguments").WorkCenter;
					var OrderValue = oEvent.getParameter("arguments").OrderValue;
					KMSQC = oEvent.getParameter("arguments").KMSQC;
					SFC_STATUS = oEvent.getParameter("arguments").SFC_STATUS;

					AUTH_CHECK = oEvent.getParameter("arguments").AUTH_CHECK;
					var MatDescription = oEvent.getParameter("arguments").DESCRIPTION;
					this.getPairedOrderDatas();
					this.oView.byId("KMId").setValue(WorkCenter);
					this.oView.byId("OrderQTYId").setValue(OrderValue);
					this.oView.byId("StatementId").setValue(MatDescription);
					this.oView.byId("KMSQCId").setValue(KMSQC);
					this.getKMSQCValues(KMSQC);
					this.setScreenFieldsEditNotEditMode();
					this.getHarmanDetails();
					this.getChemicalDetails();
					this.getSelulozCombinationDetails();

					// this.onAfterRendering();

					//this.getComponent();
				}

				function getKMSQCValues(SQC) {
					TransactionCaller.async("ECZ_MES-4.0/SELULOZ/orderDetailScreen/getSQCParameters/KM_Parameters/T_GET_SQC_PARAMETERS", {
							I_SHOP_ORDER: SQC,
						},
						"O_JSON",
						this.getKMSQCValuesCB,
						this
					);
				}

				function getKMSQCValuesCB(iv_data, iv_scope) {
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
					iv_scope.getView().byId("KMSQCParamaterTable1").setModel(myModel);
					iv_scope.getView().byId("KMSQCParamaterTable1").getModel().refresh();
				}

				function getDMSQCValues(SQC) {
					TransactionCaller.async("ECZ_MES-4.0/SELULOZ/orderDetailScreen/getSQCParameters/KM_Parameters/T_GET_SQC_PARAMETERS", {
							I_SHOP_ORDER: SQC,
						},
						"O_JSON",
						this.getDMSQCValuesCB,
						this
					);
				}

				function getDMSQCValuesCB(iv_data, iv_scope) {
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
					iv_scope.getView().byId("DMSQCParamaterTable1").setModel(myModel);
					iv_scope.getView().byId("DMSQCParamaterTable1").getModel().refresh();
				}

				function setScreenFieldsEditNotEditMode() {

					//	if (AUTH_CHECK === "AUTHORIZED" || SFC_STATUS === "401" || SFC_STATUS === "---") {

					if ((SFC_STATUS === "401" && AUTH_CHECK === "AUTHORIZED") || (SFC_STATUS === "---" && AUTH_CHECK === "AUTHORIZED")) {

						this.oView.byId("KMSQCId").setEditable(true);
						this.oView.byId("DMSQCId").setEditable(true);
						this.oView.byId("OrderQTYId").setEditable(true);
						this.oView.byId("StatementId").setEditable(true);
						this.oView.byId("HarmanId").setEditable(true);
						this.oView.byId("ChemicalId").setEditable(true);
						this.oView.byId("input1").setEditable(true);
						this.oView.byId("input2").setEditable(true);
						this.oView.byId("input3").setEditable(true);
						this.oView.byId("input4").setEditable(true);
						this.oView.byId("OrderId").setEditable(true);
						this.oView.byId("MaterialId").setEditable(true);
						this.oView.byId("OrderQtyId").setEditable(true);
						this.oView.byId("BarkodId").setEditable(true);
						this.oView.byId("BobinId").setEditable(true);
						this.oView.byId("SevkId").setEditable(true);
						this.oView.byId("KatId").setEditable(true);
						this.oView.byId("GramajId").setEditable(true);
						this.oView.byId("CapId").setEditable(true);
						this.oView.byId("IhracatId").setEditable(true);
						this.oView.byId("MihverId").setEditable(true);
						this.oView.byId("EtuId").setEditable(true);
						this.oView.byId("EtuOrderId").setEditable(true);
						this.oView.byId("KombinasyonId").setEditable(true);
						this.oView.byId("WorkcenterId").setEditable(true);
						this.oView.byId("HacimId").setEditable(true);
						this.oView.byId("SasId").setEditable(true);
						this.oView.byId("AciklamaId").setEditable(true);
						this.oView.byId("AmbalajId").setEditable(true);
						this.oView.byId("MBId").setEditable(true);
						this.oView.byId("CustomerOrderNoId").setEditable(true);
						this.oView.byId("HookId").setEditable(true);
						this.oView.byId("PaletId").setEditable(true);
						this.oView.byId("idShopOrder1").setEditable(true);
						this.oView.byId("input11").setEditable(true);
						this.oView.byId("input22").setEditable(true);
						this.oView.byId("input33").setEditable(true);
						this.oView.byId("input44").setEditable(true);
						this.oView.byId("MaterialId1").setEditable(true);
						this.oView.byId("OrderQtyId1").setEditable(true);
						this.oView.byId("BarkodId1").setEditable(true);
						this.oView.byId("BobinId1").setEditable(true);
						this.oView.byId("SevkId1").setEditable(true);
						this.oView.byId("KatId1").setEditable(true);
						this.oView.byId("GramajId1").setEditable(true);
						this.oView.byId("CapId1").setEditable(true);
						this.oView.byId("IhracatId1").setEditable(true);
						this.oView.byId("MihverId1").setEditable(true);
						this.oView.byId("EtuId1").setEditable(true);
						this.oView.byId("EtuOrderId1").setEditable(true);
						this.oView.byId("KombinasyonId1").setEditable(true);
						this.oView.byId("WorkcenterId1").setEditable(true);
						this.oView.byId("HacimId1").setEditable(true);
						this.oView.byId("SasId1").setEditable(true);
						this.oView.byId("AciklamaId1").setEditable(true);
						this.oView.byId("AmbalajId1").setEditable(true);
						this.oView.byId("MBId1").setEditable(true);
						this.oView.byId("CustomerOrderNoId1").setEditable(true);
						this.oView.byId("HookId1").setEditable(true);
						this.oView.byId("PaletId1").setEditable(true);
						this.oView.byId("idShopOrder2").setEditable(true);
						this.oView.byId("input111").setEditable(true);
						this.oView.byId("input222").setEditable(true);
						this.oView.byId("input333").setEditable(true);
						this.oView.byId("input444").setEditable(true);
						this.oView.byId("MaterialId2").setEditable(true);
						this.oView.byId("OrderQtyId2").setEditable(true);
						this.oView.byId("BarkodId2").setEditable(true);
						this.oView.byId("BobinId2").setEditable(true);
						this.oView.byId("SevkId2").setEditable(true);
						this.oView.byId("KatId2").setEditable(true);
						this.oView.byId("GramajId2").setEditable(true);
						this.oView.byId("CapId2").setEditable(true);
						this.oView.byId("IhracatId2").setEditable(true);
						this.oView.byId("MihverId2").setEditable(true);
						this.oView.byId("EtuId2").setEditable(true);
						this.oView.byId("EtuOrderId2").setEditable(true);
						this.oView.byId("KombinasyonId2").setEditable(true);
						this.oView.byId("WorkcenterId2").setEditable(true);
						this.oView.byId("HacimId2").setEditable(true);
						this.oView.byId("SasId2").setEditable(true);
						this.oView.byId("AciklamaId2").setEditable(true);
						this.oView.byId("AmbalajId2").setEditable(true);
						this.oView.byId("MBId2").setEditable(true);
						this.oView.byId("CustomerOrderNoId2").setEditable(true);
						this.oView.byId("HookId2").setEditable(true);
						this.oView.byId("PaletId2").setEditable(true);
						this.oView.byId("idShopOrder3").setEditable(true);
						this.oView.byId("input1111").setEditable(true);
						this.oView.byId("input2222").setEditable(true);
						this.oView.byId("input3333").setEditable(true);
						this.oView.byId("input4444").setEditable(true);
						this.oView.byId("MaterialId3").setEditable(true);
						this.oView.byId("OrderQtyId3").setEditable(true);
						this.oView.byId("BarkodId3").setEditable(true);
						this.oView.byId("BobinId3").setEditable(true);
						this.oView.byId("SevkId3").setEditable(true);
						this.oView.byId("KatId3").setEditable(true);
						this.oView.byId("GramajId3").setEditable(true);
						this.oView.byId("CapId3").setEditable(true);
						this.oView.byId("IhracatId3").setEditable(true);
						this.oView.byId("MihverId3").setEditable(true);
						this.oView.byId("EtuId3").setEditable(true);
						this.oView.byId("EtuOrderId3").setEditable(true);
						this.oView.byId("KombinasyonId3").setEditable(true);
						this.oView.byId("WorkcenterId3").setEditable(true);
						this.oView.byId("HacimId3").setEditable(true);
						this.oView.byId("SasId3").setEditable(true);
						this.oView.byId("AciklamaId3").setEditable(true);
						this.oView.byId("AmbalajId3").setEditable(true);
						this.oView.byId("MBId3").setEditable(true);
						this.oView.byId("CustomerOrderNoId3").setEditable(true);
						this.oView.byId("HookId3").setEditable(true);
						this.oView.byId("PaletId3").setEditable(true);
						this.oView.byId("saveAllButton").setEnabled(true);
						this.oView.byId("idAddSelulozButton").setEnabled(true);
						this.oView.byId("idComboBoxBute").setEnabled(true);
						this.oView.byId("idCommentArea").setEnabled(true);
						this.oView.byId("idDownloadSelulozButton").setEnabled(true);

					} else {
						this.oView.byId("KMSQCId").setEditable(false);
						this.oView.byId("DMSQCId").setEditable(false);
						this.oView.byId("OrderQTYId").setEditable(false);
						this.oView.byId("StatementId").setEditable(false);
						this.oView.byId("HarmanId").setEditable(false);
						this.oView.byId("ChemicalId").setEditable(false);
						this.oView.byId("input1").setEditable(false);
						this.oView.byId("input2").setEditable(false);
						this.oView.byId("input3").setEditable(false);
						this.oView.byId("input4").setEditable(false);
						this.oView.byId("OrderId").setEditable(false);
						this.oView.byId("MaterialId").setEditable(false);
						this.oView.byId("OrderQtyId").setEditable(false);
						this.oView.byId("BarkodId").setEditable(false);
						this.oView.byId("BobinId").setEditable(false);
						this.oView.byId("SevkId").setEditable(false);
						this.oView.byId("KatId").setEditable(false);
						this.oView.byId("GramajId").setEditable(false);
						this.oView.byId("CapId").setEditable(false);
						this.oView.byId("IhracatId").setEditable(false);
						this.oView.byId("MihverId").setEditable(false);
						this.oView.byId("EtuId").setEditable(false);
						this.oView.byId("EtuOrderId").setEditable(false);
						this.oView.byId("KombinasyonId").setEditable(false);
						this.oView.byId("WorkcenterId").setEditable(false);
						this.oView.byId("HacimId").setEditable(false);
						this.oView.byId("SasId").setEditable(false);
						this.oView.byId("AciklamaId").setEditable(false);
						this.oView.byId("AmbalajId").setEditable(false);
						this.oView.byId("MBId").setEditable(false);
						this.oView.byId("CustomerOrderNoId").setEditable(false);
						this.oView.byId("HookId").setEditable(false);
						this.oView.byId("PaletId").setEditable(false);
						this.oView.byId("idShopOrder1").setEditable(false);
						this.oView.byId("input11").setEditable(false);
						this.oView.byId("input22").setEditable(false);
						this.oView.byId("input33").setEditable(false);
						this.oView.byId("input44").setEditable(false);
						this.oView.byId("MaterialId1").setEditable(false);
						this.oView.byId("OrderQtyId1").setEditable(false);
						this.oView.byId("BarkodId1").setEditable(false);
						this.oView.byId("BobinId1").setEditable(false);
						this.oView.byId("SevkId1").setEditable(false);
						this.oView.byId("KatId1").setEditable(false);
						this.oView.byId("GramajId1").setEditable(false);
						this.oView.byId("CapId1").setEditable(false);
						this.oView.byId("IhracatId1").setEditable(false);
						this.oView.byId("MihverId1").setEditable(false);
						this.oView.byId("EtuId1").setEditable(false);
						this.oView.byId("EtuOrderId1").setEditable(false);
						this.oView.byId("KombinasyonId1").setEditable(false);
						this.oView.byId("WorkcenterId1").setEditable(false);
						this.oView.byId("HacimId1").setEditable(false);
						this.oView.byId("SasId1").setEditable(false);
						this.oView.byId("AciklamaId1").setEditable(false);
						this.oView.byId("AmbalajId1").setEditable(false);
						this.oView.byId("MBId1").setEditable(false);
						this.oView.byId("CustomerOrderNoId1").setEditable(false);
						this.oView.byId("HookId1").setEditable(false);
						this.oView.byId("PaletId1").setEditable(false);
						this.oView.byId("idShopOrder2").setEditable(false);
						this.oView.byId("input111").setEditable(false);
						this.oView.byId("input222").setEditable(false);
						this.oView.byId("input333").setEditable(false);
						this.oView.byId("input444").setEditable(false);
						this.oView.byId("MaterialId2").setEditable(false);
						this.oView.byId("OrderQtyId2").setEditable(false);
						this.oView.byId("BarkodId2").setEditable(false);
						this.oView.byId("BobinId2").setEditable(false);
						this.oView.byId("SevkId2").setEditable(false);
						this.oView.byId("KatId2").setEditable(false);
						this.oView.byId("GramajId2").setEditable(false);
						this.oView.byId("CapId2").setEditable(false);
						this.oView.byId("IhracatId2").setEditable(false);
						this.oView.byId("MihverId2").setEditable(false);
						this.oView.byId("EtuId2").setEditable(false);
						this.oView.byId("EtuOrderId2").setEditable(false);
						this.oView.byId("KombinasyonId2").setEditable(false);
						this.oView.byId("WorkcenterId2").setEditable(false);
						this.oView.byId("HacimId2").setEditable(false);
						this.oView.byId("SasId2").setEditable(false);
						this.oView.byId("AciklamaId2").setEditable(false);
						this.oView.byId("AmbalajId2").setEditable(false);
						this.oView.byId("MBId2").setEditable(false);
						this.oView.byId("CustomerOrderNoId2").setEditable(false);
						this.oView.byId("HookId2").setEditable(false);
						this.oView.byId("PaletId2").setEditable(false);
						this.oView.byId("idShopOrder3").setEditable(false);
						this.oView.byId("input1111").setEditable(false);
						this.oView.byId("input2222").setEditable(false);
						this.oView.byId("input3333").setEditable(false);
						this.oView.byId("input4444").setEditable(false);
						this.oView.byId("MaterialId3").setEditable(false);
						this.oView.byId("OrderQtyId3").setEditable(false);
						this.oView.byId("BarkodId3").setEditable(false);
						this.oView.byId("BobinId3").setEditable(false);
						this.oView.byId("SevkId3").setEditable(false);
						this.oView.byId("KatId3").setEditable(false);
						this.oView.byId("GramajId3").setEditable(false);
						this.oView.byId("CapId3").setEditable(false);
						this.oView.byId("IhracatId3").setEditable(false);
						this.oView.byId("MihverId3").setEditable(false);
						this.oView.byId("EtuId3").setEditable(false);
						this.oView.byId("EtuOrderId3").setEditable(false);
						this.oView.byId("KombinasyonId3").setEditable(false);
						this.oView.byId("WorkcenterId3").setEditable(false);
						this.oView.byId("HacimId3").setEditable(false);
						this.oView.byId("SasId3").setEditable(false);
						this.oView.byId("AciklamaId3").setEditable(false);
						this.oView.byId("AmbalajId3").setEditable(false);
						this.oView.byId("MBId3").setEditable(false);
						this.oView.byId("CustomerOrderNoId3").setEditable(false);
						this.oView.byId("HookId3").setEditable(false);
						this.oView.byId("PaletId3").setEditable(false);
						this.oView.byId("saveAllButton").setEnabled(false);
						this.oView.byId("idAddSelulozButton").setEnabled(false);
						this.oView.byId("idComboBoxBute").setEnabled(false);
						this.oView.byId("idCommentArea").setEnabled(false);
						this.oView.byId("idDownloadSelulozButton").setEnabled(false);
					}

				}

				function onAfterRendering2() {

					count++;
					this.getView().byId("listVBox").addItem(
						new sap.m.Input({
							placeholder: "test"
						})
					);

				}

				//    var oSimpleForm = new sap.ui.layout.form.SimpleForm(
				//     "form1", {
				//       layout: sap.ui.layout.form.SimpleFormLayout.ResponsiveGridLayout,
				//       editable: true,
				//       content: [
				//         new sap.ui.core.Title({
				//           text: ""
				//         }),
				//         new sap.m.Label({
				//           text: oBundle.getText("Department_Code")
				//         })]
				//     })
				//     this.getView().byId("page").addContent(oSimpleForm);

				function _fnRouteMatched(oEvent) {
					var sRouteName = oEvent.getParameter("name");
					if (sRouteName === "Main2") {
						var args = oEvent.getParameter("arguments");
						this._fnAttachment(args);
					}
				}

				function _fnAttachment(args) {
					if (!args) {
						this.onNavBack();
					} else {
						that = this;
					}
				}

				function onDataExportPDF() {
					debugger;
					var doc1 = new jsPDF("p", "pt");
					var columns = ["Adet", "Ağırlık (kg)", "Büte Tipi"];
					var data = this.getView()
						.byId("isdSelulozDetailTable")
						.getModel()
						.getData().Rowsets.Rowset.Row;

					doc1.autoTable(columns, data);
					doc1.save("DemoData.pdf");
				}

				function onNavBack() {
					this.router.navTo("Main");
				}

				function setDateFunction() {
					var date = new Date();
					var yesterday = new Date();
					var today = new Date();
					yesterday.setDate(date.getDate() - 2);
					today.setDate(date.getDate() + 2);
					this.getView().byId("DTP1").setDateValue(yesterday);
					this.getView().byId("DTP2").setDateValue(today);
				}

				function onPressFilterButton() {
					var selectedWorkCenter = this.getView()
						.byId("workCenterComboBox")
						.getValue();

					var startTime = this.getView().byId("DTP1").getDateValue();
					var endTime = this.getView().byId("DTP2").getDateValue();
					// alert(selectedWorkCenter);

					if (startTime == null || endTime == null) {
						MessageBox.error("Tarih alanları boş bırakılamaz");
						return;
					}
					startTime = startTime.toISOString();
					endTime = endTime.toISOString();
					// var orderNo = this.getView().byId("INP1").getValue();
					// var operNo = this.getView().byId("INP2").getValue();
					// var castNo = this.getView().byId("INP3").getValue();
					// var batchNo = this.getView().byId("INP4").getValue();
					// var materialNo = this.getView().byId("INP5").getValue();
					// var workplace = this.getView().byId("INP6").getValue();
					this.getOrderList(selectedWorkCenter, startTime, endTime);
				}

				function getHarmanDetails() {
					var shopOrder = this.getView().byId("KMSQCId").getValue();

					TransactionCaller.async(
						"ECZ_MES-4.0/SELULOZ/orderDetailScreen/getHarmanMaterial/T_GetHarmanMaterials", {
							I_SHOP_ORDER: shopOrder
						},
						"O_JSON",
						this.getHarmanDetailsCB,
						this,
						"GET"
					);
				}

				function getHarmanDetailsCB(iv_data, iv_scope) {
					var myModel = new sap.ui.model.json.JSONModel();
					if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
						myModel.setData(iv_data[0]);
					} else if (!iv_data[0].Rowsets.Rowset.Row) {
						myModel.setData(null);
					} else {
						var obj_iv_data = iv_data[0];
						var dummyData = [];
						dummyData.push(iv_data[0].Rowsets.Rowset.Row);
						obj_iv_data.Rowsets.Rowset.Row = dummyData;
						myModel.setData(obj_iv_data);
					}

					iv_scope.getView().byId("harmanDetailsTable").setModel(myModel);
				}

				function getChemicalDetails() {
					var shopOrder = this.getView().byId("KMSQCId").getValue();
					TransactionCaller.async(
						"ECZ_MES-4.0/SELULOZ/orderDetailScreen/getChemicalMaterials/T_GetChemicalMaterials", {
							I_SHOP_ORDER: shopOrder
						},
						"O_JSON",
						this.getChemicalDetailsCB,
						this,
						"GET"
					);
				}

				function getChemicalDetailsCB(iv_data, iv_scope) {
					var myModel = new sap.ui.model.json.JSONModel();
					if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
						myModel.setData(iv_data[0]);
					} else if (!iv_data[0].Rowsets.Rowset.Row) {
						myModel.setData(null);
					} else {
						var obj_iv_data = iv_data[0];
						var dummyData = [];
						dummyData.push(iv_data[0].Rowsets.Rowset.Row);
						obj_iv_data.Rowsets.Rowset.Row = dummyData;
						myModel.setData(obj_iv_data);
					}

					iv_scope.getView().byId("chemicalDetailsTable").setModel(myModel);
				}

				function getSelulozCombinationDetails() {
					var shopOrder = this.getView().byId("KMSQCId").getValue();

					TransactionCaller.async(
						"ECZ_MES-4.0/SELULOZ/orderDetailScreen/getSelulozCombinationData/T_GetSelulozCombinationData", {
							I_SHOP_ORDER: shopOrder
						},
						"O_JSON",
						this.getSelulozCombinationDetailsCB,
						this,
						"GET"
					);
				}

				function getSelulozCombinationDetailsCB(iv_data, iv_scope) {
					var myModel = new sap.ui.model.json.JSONModel();
					if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
						myModel.setData(iv_data[0]);
					} else if (!iv_data[0].Rowsets.Rowset.Row) {
						myModel.setData(null);
					} else {
						var obj_iv_data = iv_data[0];
						var dummyData = [];
						dummyData.push(iv_data[0].Rowsets.Rowset.Row);
						obj_iv_data.Rowsets.Rowset.Row = dummyData;
						myModel.setData(obj_iv_data);
					}

					iv_scope.getView().byId("isdSelulozDetailTable").setModel(myModel);
				}

				function getSelulozCombinationDetailsFragmentTable() {
					var shopOrder = this.getView().byId("KMSQCId").getValue();
					var buteType = this.getView().byId("idComboBoxBute").getSelectedKey();

					TransactionCaller.async(
						"ECZ_MES-4.0/SELULOZ/orderDetailScreen/getSelulozCombinationData/T_GetAddHarmanFilter", {
							I_SHOP_ORDER: shopOrder,
							I_TYPE: buteType
						},
						"O_JSON",
						this.getSelulozCombinationDetailsFragmentTableCB,
						this,
						"GET"
					);
				}

				function getSelulozCombinationDetailsFragmentTableCB(iv_data, iv_scope) {
					var myModel = new sap.ui.model.json.JSONModel();
					if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
						myModel.setData(iv_data[0].Rowsets.Rowset.Row);
					} else if (!iv_data[0].Rowsets.Rowset.Row) {
						myModel.setData(null);
					} else {
						var obj_iv_data = iv_data[0];
						var dummyData = [];
						dummyData.push(iv_data[0].Rowsets.Rowset.Row);
						obj_iv_data.Rowsets.Rowset.Row = dummyData;
						myModel.setData(obj_iv_data.Rowsets.Rowset.Row);
					}
					sap.ui.core.Fragment.byId(
						"Z_SelulozAddFragment",
						"idSelulozAddTable"
					).setModel(myModel);
					// iv_scope.getView().byId("isdSelulozDetailTable").setModel(myModel);
				}

				function getAllWCS() {
					TransactionCaller.async(
						"ECZ_MES-4.0/KAGIT/SHOP_ORDER_RELEASE/GET_ALL_WC/T_SlcAllWCList", {},
						"O_JSON",
						this.getAllWCSCB,
						this,
						"GET"
					);
				}

				function getAllWCSCB(iv_data, iv_scope) {
					var myModel = new sap.ui.model.json.JSONModel();
					if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
						myModel.setData(iv_data[0]);
					} else if (!iv_data[0].Rowsets.Rowset.Row) {
						myModel.setData(null);
					} else {
						var obj_iv_data = iv_data[0];
						var dummyData = [];
						dummyData.push(iv_data[0].Rowsets.Rowset.Row);
						obj_iv_data.Rowsets.Rowset.Row = dummyData;
						myModel.setData(obj_iv_data);
					}

					iv_scope.getView().byId("workCenterComboBox").setModel(myModel);
				}

				function getOrderList(selectedWorkCenter, startTime, endTime) {
					TransactionCaller.async(
						"ECZ_MES-4.0/KAGIT/SHOP_ORDER_RELEASE/T_GetShopOrderListFromWC", {
							I_WORKCENTER: selectedWorkCenter,
							I_STARTDATE: startTime,
							I_ENDDATE: endTime,
						},
						"O_JSON",
						this.getOrderListCB,
						this
					);
				}

				function getOrderListCB(iv_data, iv_scope) {
					var myModel = new sap.ui.model.json.JSONModel();
					if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
						myModel.setData(iv_data[0]);
					} else if (!iv_data[0].Rowsets.Rowset.Row) {
						myModel.setData(null);
					} else {
						var obj_iv_data = iv_data[0];
						var dummyData = [];
						dummyData.push(iv_data[0].Rowsets.Rowset.Row);
						obj_iv_data.Rowsets.Rowset.Row = dummyData;
						myModel.setData(obj_iv_data);
					}

					iv_scope.getView().byId("orderReleasedTable1").setModel(myModel);
					iv_scope.getView().byId("orderReleasedTable1").setBusy(false);

					MessageToast.show("Tablo güncellendi");
				}

				function onOrdersTableSelectionChange(oEvent) {
					var sIndex = oEvent.getSource().getSelectedIndex();
					var smBinding = this.getView()
						.byId("orderReleasedTable1")
						.getBindingPath("rows");
					var tableData = this.getView()
						.byId("orderReleasedTable1")
						.getModel()?.getObject(smBinding);
					var selectedShopOrder = this.getView()
						.byId("orderReleasedTable1")
						.getModel()?.getObject(smBinding)[sIndex].SHOP_ORDER;

					this.getSecondTableOrderDatas(selectedShopOrder);
				}

				function setDummyData() {
					let dummyData = {
						dummydata: [{
							kolon: "Uzun Büte",
							kolon1: "Uzun",
						}, {
							kolon: "Kısa Büte",
							kolon1: "Kısa",
						}, {
							kolon: "Deşe Büte",
							kolon1: "Dese",
						}, ],
					};
					var myModel = new sap.ui.model.json.JSONModel();
					myModel.setData(dummyData);
					this.getView().byId("idComboBoxBute").setModel(myModel);
				}

				function onPressOrderDetailButton() {
					var selectedWorkCenter = this.getView()
						.byId("workCenterComboBox")
						.getValue();

					var startTime = this.getView().byId("DTP1").getDateValue();
					var endTime = this.getView().byId("DTP2").getDateValue();
					// alert(selectedWorkCenter);
				}

				function getDialog1() {
                    
					if (!this._oDialog) {
						this._oDialog = sap.ui.xmlfragment(
							"orderDetails",
							"orderReleaseScreen.view.fragments.orderDetailsPopUp",
							this
						);
						this.getView().addDependent(this._oDialog);
					}
					//   return this._oDialog;
					this._oDialog.open();
				}

				function onPressOrderDetailButton(oEvent) {

					this.getDialog1().open();

				}

				function onFragmentCancel() {
					this.getDialog1().close();
				}

				function onPressharmanEditButton() {}

				function onPressharmanSaveButton() {}

				function onPresschemicalEditButton() {}

				function onPresschemicalSaveButton() {}

				function harmanInputChange(oEvent) {
					var shopOrder = this.getView().byId("KMSQCId").getValue();
					var jsonData = JSON.stringify(
						this.oView.byId("harmanDetailsTable").getModel().getData().Rowsets
						.Rowset.Row
					);

					var response = TransactionCaller.sync(
						"ECZ_MES-4.0/SELULOZ/orderDetailScreen/saveHarmanMaterial/T_saveHarmanValuesFromScreenDeneme", {
							I_jsonData: jsonData,
							I_SHOP_ORDER: shopOrder,
						},
						"O_JSON"
					);

				MessageBox.show(response[0]);
					this.getHarmanDetails();
				}

				function chemicalInputChange(oEvent) {
					var shopOrder = this.getView().byId("KMSQCId").getValue();

					var jsonData = JSON.stringify(
						this.oView.byId("chemicalDetailsTable").getModel().getData().Rowsets
						.Rowset.Row
					);

					var response = TransactionCaller.sync(
						"ECZ_MES-4.0/SELULOZ/orderDetailScreen/saveChemicalMaterials/T_saveChemicalValuesFromScreen", {
							I_jsonData: jsonData,
							I_SHOP_ORDER: shopOrder,
						},
						"O_JSON"
					);

					//MessageBox.show(response[0]);

					this.getChemicalDetails();
				}

				function onChemicalTableSelectionChange(oEvent) {
					var sIndex = this.getView()
						.byId("chemicalDetailsTable")
						.getSelectedIndex();

					var table = this.getView().byId("chemicalDetailsTable");
					var sBinding = table.getBindingPath("rows");
					var tableData = table.getModel()?.getObject(sBinding);

					tableData[sIndex].EDITABLE = true;
					table.getModel().refresh();
					table.getModel().refresh;
				}

				function onPressAddSelulozButton(oEvent) {

					if (sap.ui.core.Fragment.byId(
							"Z_SelulozAddFragment",
							"quantity").getValue() == "") {
						MessageBox.show("Lütfen miktar giriniz.");

						return;
					}
					var material = sap.ui.core.Fragment.byId(
						"Z_SelulozAddFragment",
						"idMaterialCombobox"
					).getSelectedKey();
					var weight = sap.ui.core.Fragment.byId(
							"Z_SelulozAddFragment",
							"idMaterialCombobox"
						)
						.getModel()
						.getData()
						.Rowsets.Rowset.Row.find((o) => o.ITEM == material).WEIGHT;
					var quantity = sap.ui.core.Fragment.byId(
						"Z_SelulozAddFragment",
						"quantity"
					).getValue();

					var existingTableData = [];

					sap.ui.core.Fragment.byId("Z_SelulozAddFragment", "idSelulozAddTable")
						.getModel()?.getData()?.forEach((input, index) => {
							existingTableData[index] = input;
						});

					var jsonDataforInputs = [];
					jsonDataforInputs.push({
						MATERIAL: material,
						QUANTITY: quantity,
						TYPE: this.getView().byId("idComboBoxBute").getSelectedKey(),
						WEIGHT: weight * quantity,
					});
					existingTableData[existingTableData.length] = jsonDataforInputs[0];
					var oModel = new sap.ui.model.json.JSONModel();

					oModel.setData(existingTableData);
					sap.ui.core.Fragment.byId(
						"Z_SelulozAddFragment",
						"idSelulozAddTable"
					).setModel(oModel);
				}

				function getTotal() {
					totalSeluloz = 0;
					// this.getView().byId('idUzunTable').getModel().getData().Rowsets.Rowset.Row.forEach(function(a){
					// myModel.getData().Rowsets.Rowset.Row.forEach(function(a){
					//   if(a.MARKA !== "BALYA TOPLAMI"){
					//     totalSeluloz+=Number(a.ADET);
					//}              
					// });

					var myModel = sap.ui.core.Fragment.byId("Z_SelulozAddFragment", "idSelulozAddTable").getModel();

					for (var i = 0; i < myModel.oData.length; i++) {
						totalSeluloz += Number(myModel.oData[i].QUANTITY);
					}

				}

				function getTotalDese() {
					totalDese = 0;
					// this.getView().byId('idUzunTable').getModel().getData().Rowsets.Rowset.Row.forEach(function(a){
					// myModel.getData().Rowsets.Rowset.Row.forEach(function(a){
					//   if(a.MARKA !== "BALYA TOPLAMI"){
					//     total+=Number(a.ADET);
					//}
					// });

					var myModel = sap.ui.core.Fragment.byId("Z_SelulozAddFragment", "idSelulozAddTable").getModel();

					for (var i = 0; i < myModel.oData.length; i++) {
						totalDese += Number(myModel.oData[i].WEIGHT);
					}
				}

				function onPressSelulozAddButton() {

					if (this.getView().byId("idComboBoxBute").getSelectedKey() == "") {
						MessageBox.show("Seluloz yuklemek icin lutfen Bute Secimi yapiniz");
						return;
					}

					if (!this._oDialogSelulozAdd) {
						this._oDialogSelulozAdd = sap.ui.xmlfragment(
							"Z_SelulozAddFragment",
							"orderReleaseScreen.view.fragments.selulozAdd",
							this
						);

						this.getView().addDependent(this._oDialogSelulozAdd);
					}

					this._oDialogSelulozAdd.open();
					var buteValue = this.getView()
						.byId("idComboBoxBute")
						.getSelectedKey();
					//sap.ui.core.Fragment.byId("Z_SelulozAddFragment", "idButeType").setText(buteValue);

					this.getAllMaterials();
					this.getSelulozCombinationDetailsFragmentTable();

				}



				function getAllMaterials() {
					var buteType = this.getView().byId("idComboBoxBute").getSelectedKey();
					TransactionCaller.async(
						"ECZ_MES-4.0/KAGIT/selulozCombinationScreen/T_GetMaterialsBelongsToSeluloz", {
							I_TYPE: buteType
						},
						"O_JSON",
						this.getAllMaterialsCB,
						this,
						"GET", {}
					);
				}

				function getAllMaterialsCB(iv_data, iv_scope) {
					var oModel = new sap.ui.model.json.JSONModel();

					if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
						oModel.setData(iv_data[0]);
					} else {
						var obj_iv_data = iv_data[0];
						var dummyData = [];
						dummyData.push(iv_data[0].Rowsets.Rowset.Row);
						obj_iv_data.Rowsets.Rowset.Row = dummyData;
						oModel.setData(obj_iv_data);
					}

					sap.ui.core.Fragment.byId(
						"Z_SelulozAddFragment",
						"idMaterialCombobox"
					).setModel(oModel);
					// iv_scope.getView().byId("idMaterialCombobox").setModel(oModel);
				}

				function onConfirmSelulozAddButton(oEvent) {

					var shopOrder = this.getView().byId("KMSQCId").getValue();
					//var buteType = sap.ui.core.Fragment.byId("Z_SelulozAddFragment", "idButeType").getText();
					var buteType = this.getView().byId("idComboBoxBute").getSelectedKey();
					var jsonData = sap.ui.core.Fragment.byId(
							"Z_SelulozAddFragment",
							"idSelulozAddTable"
						)
						.getModel()
						.getJSON();
					this.getTotal();
					this.getTotalDese();

					if (totalSeluloz > 20 && buteType == 'Uzun' || totalSeluloz > 20 && buteType == 'Kısa') {
						MessageBox.error("Toplam balya adedi '20' sınırını aşmıştır");

						return;
					} else if (totalDese > 1500 && buteType == 'Dese') {
						MessageBox.error("Ağırlık '1500' sınırını aşmıştır");
					} else {
						TransactionCaller.async(
							"ECZ_MES-4.0/SELULOZ/orderDetailScreen/saveSelulozData/T_saveSelulozInputsFromScreen", {
								I_SHOP_ORDER: shopOrder,
								I_TYPE: buteType,
								I_DATA: jsonData
							},
							"O_JSON",
							this.onConfirmSelulozAddButtonCB,
							this,
							"GET"
						);
					}
				}

				function onCancelSelulozButton() {
					//this._oDialogSelulozAdd.close();

                    this._oDialogSelulozAdd.close();
                    sap.ui.core.Fragment.byId(
                        "Z_SelulozAddFragment",
                        "quantity"
                    ).setValue();
                    

				}

				function onDelete() {

					var oTable = sap.ui.core.Fragment.byId("Z_SelulozAddFragment", "idSelulozAddTable");
					var oModel2 = oTable.getModel();
					var aRows = oModel2.getData();
					var aContexts = oTable.getSelectedContexts();

					for (var i = aContexts.length - 1; i >= 0; i--) {
						var oThisObj = aContexts[i].getObject();
						var index = $.map(aRows, function (obj, index) {

							if (obj === oThisObj) {
								return index;
							}
						});

						aRows.splice(index, 1);
					}

					oModel2.setData(aRows);
					oModel2.refresh();
					oTable.removeSelections(true);

				}

				function onConfirmSelulozAddButtonCB(iv_data, iv_scope) {
					iv_scope.deleteSFC();
					iv_scope.getSelulozCombinationDetails();
					iv_scope._oDialogSelulozAdd.close();
sap.ui.core.Fragment.byId(
                        "Z_SelulozAddFragment",
                        "quantity"
                    ).setValue();
				}

				function getPairedOrderDatas(selectedShopOrder) {
					TransactionCaller.async(
						"ECZ_MES-4.0/KAGIT/SHOP_ORDER_RELEASE/FIND_PAIRED_ORDERS/T_FindPairedOrders", {
							I_AUFNR: KMSQC,
						},
						"O_JSON",
						this.getPairedOrderDatasCB,
						this
					);
				}

				function getPairedOrderDatasCB(iv_data, iv_scope) {
					var myModel = new sap.ui.model.json.JSONModel();
					if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
						myModel.setData(iv_data[0]);
					} else if (!iv_data[0].Rowsets.Rowset.Row) {
						myModel.setData(null);
					} else {
						var obj_iv_data = iv_data[0];
						var dummyData = [];
						dummyData.push(iv_data[0].Rowsets.Rowset.Row);
						obj_iv_data.Rowsets.Rowset.Row = dummyData;
						myModel.setData(obj_iv_data);
					}
					iv_scope.getView().byId("pairedOrderListHbox").setModel(myModel);
					iv_scope.setPairedDatasToScreen(iv_data);
					iv_scope.getDMSQCValues(myModel.getData()?.Rowsets?.Rowset?.Row[0]?.SHOP_ORDER);

				}

				function setPairedDatasToScreen(iv_data) {
					//ilk basta hepsini visible false yapmak icin eklendi
					this.setVisibleFalse();

					if (iv_data[0].Rowsets.Rowset.Row !== undefined) {
						var orderLength = iv_data[0].Rowsets.Rowset.Row.length;
						var dummyStr;

						for (var i = 1; i <= orderLength; i++) {
							dummyStr = "pairedOrderList";
							dummyStr = dummyStr + i;
							this.getView().byId(dummyStr).setVisible(true);
						}
					}

				}

				function navBack() {
					if ((SFC_STATUS === "401" && AUTH_CHECK === "AUTHORIZED") || (SFC_STATUS === "---" && AUTH_CHECK === "AUTHORIZED")) {
						var total = 0;
						var j = 0;
						for (var i = 0; i < this.getView().byId("harmanDetailsTable").getModel().getData().Rowsets.Rowset.Row.length; i++) {
							j = this.getView().byId("harmanDetailsTable").getModel().getData().Rowsets.Rowset.Row[i].VALUE;
							if (j != null) {
								total++;
							}
						}
						if (total == 0) {
							//MessageBox.show("Hiçbir değer kaydetmediniz.");
							if (!this.oApproveDialog) {
								this.oApproveDialog = new Dialog({
									type: DialogType.Message,
									title: "Confirm",
									content: new Text({
										text: "Hiçbir değer kaydetmediniz. Çıkmak istediğinize emin misiniz ?"
									}),
									beginButton: new Button({
										type: ButtonType.Emphasized,
										text: "Evet",
										press: function () {
											oRouter.navTo("RouteMain", {

												})
												//  MessageToast.show("Submit pressed!");
											this.oApproveDialog.close();
										}.bind(this),
									}),
									endButton: new Button({
										text: "Hayır",
										press: function () {
											this.oApproveDialog.close();
										}.bind(this),
									}),
								});
							}

							this.oApproveDialog.open();

						} else {
							oRouter.navTo("RouteMain", {

							})
						}
					} else {
						oRouter.navTo("RouteMain", {

						})
					}

				}

				function saveAll() {

					var errorStatus = false;
					this.getView().byId("harmanDetailsTable").getModel().getData().Rowsets.Rowset.Row.forEach((item) => {

						if (Number(item.VALUE) > 100) {
							errorStatus = true;
						}
					}, this)

					if (errorStatus) {

						MessageBox.error("Harman değeri '100'den büyük olamaz.");

						return;
					}

					this.harmanInputChange();
					this.chemicalInputChange();
					this.saveEbatButton();
					this.deleteSFC();

				}

				function setVisibleFalse() {

					this.getView().byId("pairedOrderList1").setVisible(false);
					this.getView().byId("pairedOrderList2").setVisible(false);
					this.getView().byId("pairedOrderList3").setVisible(false);
					this.getView().byId("pairedOrderList4").setVisible(false);

				}

				function saveEbatButton() {

					//var shopOrder = this.getView().byId("input12").getValue();
					//var shopOrder = this.getView().byId("input14").getValue();
					//var ebat = this.getView().byId("input1").getValue();
					//var kraft = this.getView().byId("input2").getValue();
					//var strech = this.getView().byId("input3").getValue();
					//var takoz = this.getView().byId("input4").getValue();

					var container = [];
					this.getView().byId("pairedOrderListHbox").getModel().getData().Rowsets.Rowset.Row.forEach((item, index) => {
						container.push({
							"SHOP_ORDER": item.SHOP_ORDER,
							"EBAT": item.EBAT,
							"KRAFT": item.KRAFT,
							"TAKOZ": item.TAKOZ,
							"STRECH": item.STRECH,
							"PALET": item.PALET,
							"NOHOOK": item.NOHOOK,
							"CUSTOMERORDER": item.CUSTOMERORDER,
							"MBCAPI": item.MBCAPI,
							"AMBALAJ": item.AMBALAJ,
							"URETIM": item.URETIM,
							"SASNO": item.SASNO,
							"HACIM": item.HACIM,
							"KOMBINASYON": item.KOMBINASYON,
							"ETUKLM": item.ETUKLM,
							"ETU": item.ETU,
							"MIHVER": item.MIHVER,
							"IHRACAT": item.IHRACAT,
							"CAP": item.CAP,
							"GRAMAJ": item.GRAMAJ,
							"KAT": item.KAT,
							"SEVK": item.SEVK,
							"TAKIM": item.TAKIM,
							"BARKOD": item.BARKOD,
							"SIPARIS": item.SIPARIS
						})
					})
					var json = JSON.stringify(container);

					//var jsonData = JSON.stringify(
					//this.oView.byId("harmanDetailsTable").getModel().getData().Rowsets
					//.Rowset.Row
					// );

					var response = TransactionCaller.sync(
						"ECZ_MES-4.0/KAGIT/TAMPON_CREATE/UPDATE_SO/T_UpdShopOrderCustomDataSave", {
							//I_SHOP_ORDER: shopOrder,
							I_JSON: json, //(VEYA DİREK JSON.stringify(container))
							//I_EBAT: ebat,
							//I_KRAFT:kraft,
							//I_STRECH:strech,
							//I_TAKOZ:takoz,
						},
						"O_JSON"
					);

					//MessageBox.show(response[0]);
					// this.getHarmanDetails();

				}

				function deleteSFC() {
					var response = TransactionCaller.sync(
						"ECZ_MES-4.0/KAGIT/TAMPON_CREATE/UPDATE_SO/updateStatus/T_SfcDelete", {
							I_SHOP_ORDER: this.getView().byId("KMSQCId").getValue()
						},
						"O_JSON"
					);
					//MessageBox.show(response[0]);
				}

				function onChangeHarmanRatio(oEvent) {
					var selectedIndex = oEvent.oSource.getParent().getBindingContext().getPath().split("/")[4];
					var oTableData = this.getView().byId("harmanDetailsTable").getModel().getData();
					var VALUE = oTableData.Rowsets.Rowset.Row[selectedIndex].VALUE;

					if (VALUE > 100 || VALUE < 0) {
						MessageBox.error("Girdiğiniz değer 0-100 arasında olmak zorundadır");
						oTableData.Rowsets.Rowset.Row[selectedIndex].VALUE = "";
						this.getView().byId("harmanDetailsTable").getModel().refresh();
					}
				}

                

			})()
		);
	}
);