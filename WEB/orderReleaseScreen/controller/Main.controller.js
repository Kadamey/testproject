/* global sap,$,_ */
sap.ui.define(
	[
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"orderReleaseScreen/scripts/transactionCaller",
	],
	function (
		Controller,
		JSONModel,
		MessageToast,
		MessageBox,
		TransactionCaller
	) {
		"use strict";
		/* jshint -W061 */
		var oRouter;
		var WorkCenter;
		var OrderValue;
		var MatDescription;
		var KMSQC;
		var DMSQC;
		var SFC_STATUS;
		var AUTH_CHECK;
		var SITE;

		var selectedWorkCenter;
		var startTime = "";
		var endTime = "";
		var selectedShopOrder;
		return Controller.extend(
			"orderReleaseScreen.controller.Main",
			(function () {
				var controller;
				var previous;

				return {
					onInit: onInit,
					onPressFilterButton: onPressFilterButton,
					getOrderList: getOrderList,
					getOrderListCB: getOrderListCB,
					getAllWCS: getAllWCS,
					getAllWCSCB: getAllWCSCB,
					onOrdersTableSelectionChange: onOrdersTableSelectionChange,
					getSecondTableOrderDatas: getSecondTableOrderDatas,
					getSecondTableOrderDatasCB: getSecondTableOrderDatasCB,
					onPressReleaseButton: onPressReleaseButton,
					setDateFunction: setDateFunction,
					//onPressOrderDetailButton: onPressOrderDetailButton,
					//getDialog1: getDialog1,
					onPressOrderDetails: onPressOrderDetails,
					onSelectAllOrderCheckBox: onSelectAllOrderCheckBox,
					onSelectAllOrderCheckBoxCB: onSelectAllOrderCheckBoxCB,
					onPressOrderSearchButton: onPressOrderSearchButton,
					onPressOrderSearchButtonCB: onPressOrderSearchButtonCB,
					getUserAuthorizationCheckFromUsername: getUserAuthorizationCheckFromUsername,
					onEditPriority: onEditPriority,
					saveNewOrderNoCB: saveNewOrderNoCB
				};

				var that = this;

				function onInit() {
					oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					this.setDateFunction();
					this.getAllWCS();
					SITE = jQuery.sap.getUriParameters().get("SITE");
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
					selectedWorkCenter = this.getView()
						.byId("workCenterComboBox")
						.getValue();

					startTime = this.getView().byId("DTP1").getDateValue();
					endTime = this.getView().byId("DTP2").getDateValue();

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
							I_SITE: SITE
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
					iv_scope.getView().byId("orderReleasedTable1").getModel().refresh();

					//MessageToast.show("Tablo güncellendi");
				}

				function getSecondTableOrderDatas(selectedShopOrder) {
					TransactionCaller.async(
						"ECZ_MES-4.0/KAGIT/SHOP_ORDER_RELEASE/FIND_PAIRED_ORDERS/T_FindPairedOrders", {
							I_AUFNR: selectedShopOrder,
						},
						"O_JSON",
						this.getSecondTableOrderDatasCB,
						this
					);
				}

				function getSecondTableOrderDatasCB(iv_data, iv_scope) {
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

					iv_scope.getView().byId("orderReleasedTable2").setModel(myModel);
					iv_scope.getView().byId("orderReleasedTable2").setBusy(false);
				}

				function onPressReleaseButton() {

					var sIndex = this.getView()
						.byId("orderReleasedTable1")
						.getSelectedIndex();
					var smBinding = this.getView()
						.byId("orderReleasedTable1")
						.getBindingPath("rows");
					var tableData = this.getView()
						.byId("orderReleasedTable1")
						.getModel()?.getObject(smBinding);
					var selectedShopOrder = this.getView()
						.byId("orderReleasedTable1")
						.getModel()?.getObject(smBinding)[sIndex].SHOP_ORDER;

					var response = TransactionCaller.sync(
						"ECZ_MES-4.0/KAGIT/SHOP_ORDER_RELEASE/RELEASE_SHOP_ORDER/T_ReleaseShopOrder", {
							I_SHOP_ORDER: selectedShopOrder,
						},
						"O_JSON"
					);
					this.onPressFilterButton();

					var msg = response[0];
					MessageToast.show(msg);

					this.getView().byId("orderReleasedTable2").setModel(new sap.ui.model.json.JSONModel());

				}

				function onOrdersTableSelectionChange(oEvent) {
					var sIndex = oEvent.getSource().getSelectedIndex();
					var smBinding = this.getView()
						.byId("orderReleasedTable1")
						.getBindingPath("rows");
					var tableData = this.getView()
						.byId("orderReleasedTable1")
						.getModel()?.getObject(smBinding);
					selectedShopOrder = this.getView()
						.byId("orderReleasedTable1")
						.getModel()?.getObject(smBinding)[sIndex].SHOP_ORDER;

					this.getSecondTableOrderDatas(selectedShopOrder);
				}

				function onPressOrderDetails() {
					var selectedRowIndex = this.oView.byId("orderReleasedTable1").getSelectedIndex();
					if (selectedRowIndex >= 0) {
						WorkCenter = this.getView().byId("orderReleasedTable1").getModel().getData().Rowsets.Rowset.Row[selectedRowIndex].WORK_CENTER;
						OrderValue = this.getView().byId("orderReleasedTable1").getModel().oData.Rowsets.Rowset.Row[selectedRowIndex].QTY_ORDERED;
						MatDescription = this.getView().byId("orderReleasedTable1").getModel().oData.Rowsets.Rowset.Row[selectedRowIndex].ITEM_DESCRIPTION;
						KMSQC = this.getView().byId("orderReleasedTable1").getModel().oData.Rowsets.Rowset.Row[selectedRowIndex].SHOP_ORDER;
						SFC_STATUS = this.getView().byId("orderReleasedTable1").getModel().oData.Rowsets.Rowset.Row[selectedRowIndex].SFC_STATUS;
						this.getUserAuthorizationCheckFromUsername();

						oRouter.navTo("RouteMain2", {
							"WorkCenter": WorkCenter,
							"OrderValue": OrderValue,
							"KMSQC": KMSQC,
							"DMSQC": KMSQC,
							"DESCRIPTION": MatDescription,
							"SFC_STATUS": SFC_STATUS,
							"AUTH_CHECK": AUTH_CHECK
						});

					} else {

						var msg = "Bir sipariş seçiniz.."
						MessageToast.show(msg);

					}
				}

				function onPressOrderDetailButton() {
					selectedWorkCenter = this.getView()
						.byId("workCenterComboBox")
						.getValue();

					startTime = this.getView().byId("DTP1").getDateValue();
					endTime = this.getView().byId("DTP2").getDateValue();
					alert(selectedWorkCenter);
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
					return this._oDialog;
				}

				function onSelectAllOrderCheckBox() {

					if (this.getView().byId("idCheckBoxAllOrder").getSelected() == true) {
						this.getView()
							.byId("workCenterComboBox")
							.setValue("");
						TransactionCaller.async(
							"ECZ_MES-4.0/KAGIT/SHOP_ORDER_RELEASE/getAllMAterialCodes/T_FindTamponMaterials", {},
							"O_JSON",
							this.onSelectAllOrderCheckBoxCB,
							this,
							"GET"
						);

					} else {
						this.getView().byId("materialComboBox").setVisible(!this.getView().byId("materialComboBox").getVisible());
						//this.getView().byId("labelMaterial").setVisible(!this.getView().byId("labelMaterial").getVisible());
						this.getView().byId("DTP1").setVisible(!this.getView().byId("DTP1").getVisible());
						this.getView().byId("DTP2").setVisible(!this.getView().byId("DTP2").getVisible());
						//this.getView().byId("labelDTP1").setVisible(!this.getView().byId("labelDTP1").getVisible());
						//this.getView().byId("labelDTP2").setVisible(!this.getView().byId("labelDTP2").getVisible());
						this.getView().byId("searchAllOrdersButton").setVisible(!this.getView().byId("searchAllOrdersButton").getVisible());
						this.getView().byId("idOrderReleaseButton").setVisible(!this.getView().byId("idOrderReleaseButton").getVisible());
						this.getView().byId("searchOrdersButtonId").setVisible(!this.getView().byId("searchOrdersButtonId").getVisible());

						return;

					}
				}

				function onSelectAllOrderCheckBoxCB(iv_data, iv_scope) {
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

					iv_scope.getView().byId("materialComboBox").setVisible(!iv_scope.getView().byId("materialComboBox").getVisible());
					//iv_scope.getView().byId("labelMaterial").setVisible(!iv_scope.getView().byId("labelMaterial").getVisible());
					iv_scope.getView().byId("DTP1").setVisible(!iv_scope.getView().byId("DTP1").getVisible());
					iv_scope.getView().byId("DTP2").setVisible(!iv_scope.getView().byId("DTP2").getVisible());
					//iv_scope.getView().byId("labelDTP1").setVisible(!iv_scope.getView().byId("labelDTP1").getVisible());
					//iv_scope.getView().byId("labelDTP2").setVisible(!iv_scope.getView().byId("labelDTP2").getVisible());
					iv_scope.getView().byId("searchAllOrdersButton").setVisible(!iv_scope.getView().byId("searchAllOrdersButton").getVisible());
					iv_scope.getView().byId("idOrderReleaseButton").setVisible(!iv_scope.getView().byId("idOrderReleaseButton").getVisible());
					iv_scope.getView().byId("searchOrdersButtonId").setVisible(!iv_scope.getView().byId("searchOrdersButtonId").getVisible());
					iv_scope.getView().byId("materialComboBox").setModel(myModel);

				}

				function onPressOrderSearchButton(oEvent) {

					var selectedWorkCenter = this.getView()
						.byId("workCenterComboBox")
						.getValue();
					var selectedMaterial = this.getView()
						.byId("materialComboBox")
						.getSelectedKey();

					// if (selectedWorkCenter==""){

					//     MessageBox.show("İş yeri seçimi yapınız");
					//     return;
					// }

					// if (selectedMaterial==""){

					//     MessageBox.show("Malzeme seçimi yapınız");
					//     return;
					// }

					var startTime = this.getView().byId("DTP1").getDateValue();
					var endTime = this.getView().byId("DTP2").getDateValue();

					if (startTime == null || endTime == null) {
						MessageBox.error("Tarih alanları boş bırakılamaz");
						return;
					}
					startTime = startTime.toISOString();
					endTime = endTime.toISOString();

					TransactionCaller.async(
						"ECZ_MES-4.0/KAGIT/SHOP_ORDER_RELEASE/getAllOrders/T_GetShopOrderListALL", {
							I_WORKCENTER: selectedWorkCenter,
							I_STARTDATE: startTime,
							I_ENDDATE: endTime,
							I_MATERIAL: selectedMaterial,
							I_SITE: SITE
						},
						"O_JSON",
						this.onPressOrderSearchButtonCB,
						this
					);
				}

				function onPressOrderSearchButtonCB(iv_data, iv_scope) {
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
					iv_scope.getView().byId("orderReleasedTable1").getModel().refresh();

					//MessageToast.show("Tablo güncellendi");
				}

				function getUserAuthorizationCheckFromUsername() {

					var response = TransactionCaller.sync(
						"Default/T_GetUserCheckValueFromUsername", {

						},
						"O_JSON"
					);

					if (response[0] === "" || response[0] === null || response[0] === undefined) {
						AUTH_CHECK = "NOT_AUTHORIZED"
					} else {

						AUTH_CHECK = response[0];
					}
				}

				function onPressOrderDetailButton(oEvent) {

					this.getOwnerComponent().getTargets().display("page2");

					// var oContext = oEvent.getSource().getBindingContext();
					// var oObject = oContext.getObject();

					// var myModel = new JSONModel();
					// var data = {
					// 	oldValue: this.ivalue,
					// 	MATCODE: oObject.MATCODE,
					// };
					// myModel.setData(data);
					// this.getView("palletTable_Edit", "fragmentOnEdit").setModel(myModel);

					//this.getDialog1().open(); 
					//popup yoruma aldım.-1Mart2021-Dbilgin.

					// this.getDialog1().addEventDelegate(
					// 	{ onsapenter: this.onInputEditSave },
					// 	this
					// );
					// sap.ui.core.Fragment.byId("palletTable_Edit", "value1").setValue("");
				}

				function onEditPriority() {

					var selectedIndex = this.getView().byId("orderReleasedTable1").getSelectedIndex();
					if (selectedIndex >= 0) {
						var selectedItem = this.getView().byId("orderReleasedTable1").getModel().getData().Rowsets.Rowset.Row[selectedIndex];
						if (!this.oPriorityDialog) {
							this.oPriorityDialog = new sap.m.Dialog({
								id: "idDialog",
								title: "Sipariş Sıra Numarası Düzenle",
								draggable: true,
								contentWidth: "400px",
								content: new sap.m.Input({
									value: "",
									placeholder: "Yeni Sıra Numarasını Giriniz...",
									id: "idInput",
									type: "Number",
									textAlign: "Center",
								}).addStyleClass("sapUiLargeMarginTopBottom"),
								beginButton: new sap.m.Button({
									type: sap.m.ButtonType.Accept,
									text: "Kaydet",
									width: "100px",
									icon: "sap-icon://save",
									press: function () {
										TransactionCaller.async(
											"ECZ_MES-4.0/KAGIT/SHOP_ORDER_RELEASE/updShopOrderPriority/T_UpdShopOrderPriority", {
												I_SITE: SITE,
												I_SHOP_ORDER: selectedItem.SHOP_ORDER,
												I_NEW_ORDER_NO: parseInt(sap.ui.getCore().byId("idInput").getValue())
											},
											"O_JSON",
											this.saveNewOrderNoCB,
											this,
											"GET", {}
										);
									}.bind(this)
								}),
								endButton: new sap.m.Button({
									type: sap.m.ButtonType.Reject,
									text: "İptal",
									width: "100px",
									icon: "sap-icon://decline",
									press: function () {
										this.oPriorityDialog.close();
									}.bind(this)
								})
							});

							// to get access to the controller's model
							this.getView().addDependent(this.oPriorityDialog);
						}

						this.oPriorityDialog.open();
					} else {
						MessageToast.show("Lütfen Tablodan Sıra Numarasını Düzenlemek İstediğiniz Satırı Seçiniz.");
					}
				}

				function saveNewOrderNoCB(iv_data, iv_scope) {

					if (iv_data[1] === "S") {
						var myModel = new sap.ui.model.json.JSONModel();
						if (Array.isArray(iv_data[0]?.Rowsets?.Rowset?.Row)) {
							myModel.setData(iv_data[0]);
						} else {
							var obj_iv_data = iv_data[0];
							var dummyData = [];
							dummyData.push(iv_data[0]?.Rowsets?.Rowset?.Row);
							obj_iv_data.Rowsets.Rowset.Row = dummyData;
							myModel.setData(obj_iv_data);
						}

						MessageToast.show(myModel.getData().Rowsets.Rowset.Row[0], {
							duration: 5000,
							at: "center center"
						});
						iv_scope.getOrderList(selectedWorkCenter, startTime, endTime);
						iv_scope.getSecondTableOrderDatas(selectedShopOrder);
						sap.ui.getCore().byId("idInput").setValue("");
						iv_scope.oPriorityDialog.close();
					} else {
						MessageToast.show("HATA !", {
							duration: 5000,
							at: "center center"
						});
					}
				}

			})()
		);
	}
);