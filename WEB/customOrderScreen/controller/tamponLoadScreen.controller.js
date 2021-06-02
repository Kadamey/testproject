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
		"sap/ui/core/BusyIndicator",
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
		BusyIndicator
	) {
		"use strict";
		var that;

		return Controller.extend("customOrderScreen.controller.tamponLoadScreen", {


			onInit: function () {
				this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				this.oRouter.getRoute("RouteMain2").attachPatternMatched(this._onRoute, this);
				that = this;
			},

			_onRoute: function (oEvent) {
				this.selectedWorkCenter = oEvent.getParameter("arguments").WorkCenter;
				this.selectedOrderKatAdet = oEvent.getParameter("arguments").CHILDKATADET;
				this.SITE = oEvent.getParameter("arguments").SITE;
				this.setDragDropVisible();
				this.getInventoryFromWorkCenter();

			},

			getInventoryFromWorkCenter: function () {


				this.idTamponListTableTamponIdsInitial = [];
				this.firstLayerTableTamponIdsInitial = [];
				this.secondLayerTamponBobinIdsInitial = [];
				this.thirdLayerTableTamponIdsInitial = [];
				this.fourthLayerTableTamponIdsInitial = [];

				var response = TransactionCaller.async(
					"ECZ_MES-4.0/KAGIT/DM_MANAGEMENT/COMBINE_ORDER/TAMPON_LOAD/T_GetActiveOrderInventoryFromWC",
					{
						I_WC: this.selectedWorkCenter,
						I_PLANT: this.SITE,
					},
					"O_JSON",
					this.getInventoryFromWorkCenterCB,
					this,
					"GET"
				);
			},

			getInventoryFromWorkCenterCB: function (iv_data, iv_scope) {
				iv_scope.idTamponListTable = [];
				iv_scope.firstLayerTable = [];
				iv_scope.secondLayerTable = [];
				iv_scope.thirdLayerTable = [];
				iv_scope.fourthLayerTable = [];

				if (iv_data[1] == "E") {
					MessageBox.show(iv_data[0]);
				}
			
				if (Array.isArray(iv_data[0]?.Rowsets?.Rowset?.Row) || (iv_data[1] == "E")) {
				} else {
					var obj_iv_data = iv_data[0];
					var dummyData = [];
					dummyData.push(iv_data[0].Rowsets.Rowset.Row);
					iv_data = iv_data[0];
					obj_iv_data.Rowsets.Rowset.Row = dummyData;
					iv_data = [];
					iv_data.push(obj_iv_data);
				}

				iv_data[0]?.Rowsets?.Rowset?.Row?.forEach((input, index) => {
					if (input.RESRCE == null) {
						iv_scope.idTamponListTable.push(input);
						iv_scope.idTamponListTableTamponIdsInitial.push(input.INVENTORY_ID);
					}
					if (input.RESRCE == "SAGMA1") {
						iv_scope.firstLayerTable.push(input);
						iv_scope.firstLayerTableTamponIdsInitial.push(input.INVENTORY_ID);
					}
					if (input.RESRCE == "SAGMA2") {
						iv_scope.secondLayerTable.push(input);
						iv_scope.secondLayerTamponBobinIdsInitial.push(input.INVENTORY_ID);
					}
					if (input.RESRCE == "SAGMA3") {
						iv_scope.thirdLayerTable.push(input);
						iv_scope.thirdLayerTableTamponIdsInitial.push(input.INVENTORY_ID);
					}
					if (input.RESRCE == "SAGMA4") {
						iv_scope.fourthLayerTable.push(input);
						iv_scope.fourthLayerTableTamponIdsInitial.push(input.INVENTORY_ID);
					}
				});

				var myModel = new JSONModel();
				myModel.setData(iv_scope.idTamponListTable);
				iv_scope.getView().byId("idTamponListTable").setModel(myModel);

				var myModel2 = new JSONModel();
				myModel2.setData(iv_scope.firstLayerTable);
				iv_scope.getView().byId("firstLayerTable").setModel(myModel2);

				var myModel3 = new JSONModel();
				myModel3.setData(iv_scope.secondLayerTable);
				iv_scope.getView().byId("secondLayerTable").setModel(myModel3);

				var myModel4 = new JSONModel();
				myModel4.setData(iv_scope.thirdLayerTable);
				iv_scope.getView().byId("thirdLayerTable").setModel(myModel4);

				var myModel5 = new JSONModel();
				myModel5.setData(iv_scope.fourthLayerTable);
				iv_scope.getView().byId("fourthLayerTable").setModel(myModel5);
			},

			onDragStart: function (oEvent) {
				var oDraggedRow = oEvent.getParameter("target");
				var oDragSession = oEvent.getParameter("dragSession");
				this.draggedTable = oEvent
					.getParameter("target")
					.getTable()
					.sId.split("--")[1];

				// keep the dragged row context for the drop action
				oDragSession.setComplexData(
					"draggedRowContext",
					oDraggedRow.getBindingContext()
				);
			},
			onDropTable2: function (oEvent) {
				this.droppedTable = oEvent
					.getParameter("droppedControl")
					.sId.split("--")[1];

				if (this.droppedTable.includes("-") == true) {
					this.droppedTable = oEvent
						.getParameter("droppedControl")
						.getTable()
						.sId.split("--")[1];
				}
				// soldan saga tasima icin
				if (this.droppedTable != "idTamponListTable") {
					if (
						oEvent.getParameter("droppedControl").getModel() != undefined &&
						oEvent.getParameter("droppedControl").getModel()?.getData()
							.length == 2
					) {
						MessageBox.show("İki taneden fazla tampon ataması yapamazsınız");
						return;
					}

					var oDragSession = oEvent.getParameter("dragSession");
					var oDraggedRowContext = oDragSession.getComplexData(
						"draggedRowContext"
					);

					//    oEvent.getParameter("droppedControl").setBindingContext(oDraggedRowContext)

					var sPath = oDraggedRowContext.sPath;
					var draggedRowData = [];
					draggedRowData.push(
						oEvent
							.getParameter("dragSession")
							.getComplexData("draggedRowContext")
							.getModel()
							?.getObject(sPath)
					);

					var table = this.getView().byId(this.droppedTable);
					var sBinding = table.getBindingPath("rows");
					var tableData = table.getModel()?.getObject(sBinding);

					// tabloda daha önce hiç satır yoksa
					if (tableData == undefined) {
						var myModel = new JSONModel();
						myModel.setData(draggedRowData);
						oEvent.getParameter("droppedControl").setModel(myModel);
					}
					//tabload daha önce satır varsa
					if (tableData != undefined) {
						tableData.push(draggedRowData[0]);
					}
					table.getModel().refresh();

					// dragged tablodan satır silme
					var table = this.getView().byId(this.draggedTable);
					var sBinding = table.getBindingPath("rows");
					var tableData = table.getModel()?.getObject(sBinding);
					var sIndex = oEvent
						.getParameter("dragSession")
						.getComplexData("draggedRowContext")
						.sPath.split("/")[1];
					var selectedObjects = [];
					tableData.splice(sIndex, 1);
					table.getModel().refresh();

					//sağdan sola tasima icin
				} else if (this.droppedTable == "idTamponListTable") {
					//dropped tabloya satır ekleme
					var oDragSession = oEvent.getParameter("dragSession");
					var oDraggedRowContext = oDragSession.getComplexData(
						"draggedRowContext"
					);
					var draggedData = oDragSession
						.getComplexData("draggedRowContext")
						.getObject();
					var table = this.getView().byId(this.droppedTable);
					var sBinding = table.getBindingPath("rows");
					var tableData = table.getModel()?.getObject(sBinding);
					tableData.push(draggedData);
					table.getModel().refresh();

					//dragged tablodan satır silme
					var table = this.getView().byId(this.draggedTable);
					var sBinding = table.getBindingPath("rows");
					var tableData = table.getModel()?.getObject(sBinding);
					var sIndex = oEvent
						.getParameter("dragSession")
						.getComplexData("draggedRowContext")
						.sPath.split("/")[1];
					var selectedObjects = [];
					tableData.splice(sIndex, 1);
					table.getModel().refresh();
				}

				if (!oDraggedRowContext) {
					return;
				}
			},

			onPresSaveButton: function () {


				this.toBeUnReserve = [];
				this.toBeReserve = [];

				var lastSitutationfirstLayerTable = this.getView().byId("firstLayerTable").getModel()?.getData();
				var lastSitutationsecondLayerTable = this.getView().byId("secondLayerTable").getModel()?.getData();
				var lastSitutationthirdLayerTable = this.getView().byId("thirdLayerTable").getModel()?.getData();
				var lastSitutationfourthLayerTable = this.getView().byId("fourthLayerTable").getModel()?.getData();

				//reserve ve unreserve edilecek tamponları bulma 
				///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
				//SAGMA1        
				this.firstLayerTableTamponIdsInitial?.forEach((input, index) => {

					//tampon unreserve edilecek demek
					if (lastSitutationfirstLayerTable?.find((o) => o.INVENTORY_ID == input) == undefined) {
						this.toBeUnReserve.push({
							"INVENTORY_ID": input,
							"RESOURCE": "SAGMA1"
						});
					}

				})

				//tampon reserve edilecek demek
				lastSitutationfirstLayerTable?.forEach((input, index) => {

					if (this.firstLayerTableTamponIdsInitial?.find((o) => o == input.INVENTORY_ID) == undefined) {
						this.toBeReserve.push({
							"INVENTORY_ID": input.INVENTORY_ID,
							"RESOURCE": "SAGMA1"
						});

					}
				})

				//SAGMA2      
				this.secondLayerTamponBobinIdsInitial?.forEach((input, index) => {

					//tampon unreserve edilecek demek
					if (lastSitutationsecondLayerTable.find((o) => o.INVENTORY_ID == input) == undefined) {
						this.toBeUnReserve.push({
							"INVENTORY_ID": input,
							"RESOURCE": "SAGMA2"
						});
					}
				})

				//tampon reserve edilecek demek
				lastSitutationsecondLayerTable?.forEach((input, index) => {

					if (this.secondLayerTamponBobinIdsInitial?.find((o) => o == input.INVENTORY_ID) == undefined) {
						this.toBeReserve.push({
							"INVENTORY_ID": input.INVENTORY_ID,
							"RESOURCE": "SAGMA2"
						});
					}
				})

				//SAGMA3      
				this.thirdLayerTableTamponIdsInitial?.forEach((input, index) => {

					//tampon unreserve edilecek demek
					if (lastSitutationthirdLayerTable?.find((o) => o.INVENTORY_ID == input) == undefined) {
						this.toBeUnReserve.push({
							"INVENTORY_ID": input,
							"RESOURCE": "SAGMA3"
						});
					}
				})

				//tampon reserve edilecek demek
				lastSitutationthirdLayerTable?.forEach((input, index) => {

					if (this.thirdLayerTableTamponIdsInitial?.find((o) => o == input.INVENTORY_ID) == undefined) {
						this.toBeReserve.push({
							"INVENTORY_ID": input.INVENTORY_ID,
							"RESOURCE": "SAGMA3"
						});
					}
				})

				//SAGMA4     
				this.fourthLayerTableTamponIdsInitial?.forEach((input, index) => {

					//tampon unreserve edilecek demek
					if (lastSitutationfourthLayerTable?.find((o) => o.INVENTORY_ID == input) == undefined) {
						this.toBeUnReserve.push({
							"INVENTORY_ID": input,
							"RESOURCE": "SAGMA4"
						});
					}
				})

				//tampon reserve edilecek demek
				lastSitutationfourthLayerTable?.forEach((input, index) => {

					if (this.fourthLayerTableTamponIdsInitial?.find((o) => o == input.INVENTORY_ID) == undefined) {
						this.toBeReserve.push({
							"INVENTORY_ID": input.INVENTORY_ID,
							"RESOURCE": "SAGMA4"
						});
					}
				})

				///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

				// tampon seçim kontrolleri
				////////////////////////////////////////////////////////////////////////////////////////////
				if (this.toBeUnReserve.length == 0 && this.toBeReserve.length == 0) {
					MessageBox.show("Hiç bir değişiklik yapmadınız");
					return;
				}

				if ((lastSitutationfirstLayerTable?.length == undefined || lastSitutationfirstLayerTable?.length == 0) &&
					((lastSitutationsecondLayerTable?.length != undefined && lastSitutationsecondLayerTable?.length != 0) ||
						(lastSitutationthirdLayerTable?.length != undefined && lastSitutationthirdLayerTable?.length != 0) ||
						(lastSitutationfourthLayerTable?.length != undefined && lastSitutationfourthLayerTable?.length != 0))) {

					MessageBox.show("1.Kat için tampon seçimi yapınız");
					return;
				}

				if ((lastSitutationsecondLayerTable?.length == undefined || lastSitutationsecondLayerTable?.length == 0) &&
					((lastSitutationthirdLayerTable?.length != undefined && lastSitutationthirdLayerTable?.length != 0) ||
						(lastSitutationfourthLayerTable?.length != undefined && lastSitutationfourthLayerTable?.length != 0))) {

					MessageBox.show("2.Kat için tampon seçimi yapınız");
					return;
				}

				if ((lastSitutationthirdLayerTable?.length == undefined || lastSitutationthirdLayerTable?.length == 0) &&
					(lastSitutationfourthLayerTable?.length != undefined && lastSitutationfourthLayerTable?.length != 0)) {

					MessageBox.show("3.Kat için tampon seçimi yapınız");
					return;
				}


				////////////////////////////////////////////////////////////////////////////////////////////

				var response = TransactionCaller.async(
					"ECZ_MES-4.0/KAGIT/DM_MANAGEMENT/COMBINE_ORDER/RESERVE_INVENTORY/T_ReserveInventory",
					{
						I_WORKCENTER: this.selectedWorkCenter,
						I_UNRESERVE_DATA: JSON.stringify(this.toBeUnReserve),
						I_RESERVE_DATA: JSON.stringify(this.toBeReserve),
						I_SITE: this.SITE,
					},
					"O_JSON",
					this.onPresSaveButtonCB,
					this,
					"GET"
				);
			},
			onPresSaveButtonCB: function (iv_data, iv_scope) {
				MessageToast.show(iv_data[0]);

				if (iv_data[1] === "S") {
					iv_scope.navBack();
				}
			},

			navBack: function () {
				this.oRouter.navTo("RouteMain", {});
			},

			showBusyIndicator: function (iDuration, iDelay) {
				BusyIndicator.show(iDelay);

				if (iDuration && iDuration > 0) {
					if (this._sTimeoutId) {
						clearTimeout(this._sTimeoutId);
						this._sTimeoutId = null;
					}

					this._sTimeoutId = setTimeout(
						function () {
							this.hideBusyIndicator();
						}.bind(this),
						iDuration
					);
				}
			},

			hideBusyIndicator: function () {
				BusyIndicator.hide();
			},

			onPressTamponConsumptionButton: function (oEvent) {
				this.showBusyIndicator(5000, 0);

				var sIndex = oEvent.getSource().getParent().getIndex();
				var selectedLine = oEvent.getSource().getParent().getModel().getData()[
					sIndex
				];

				if (selectedLine.QTY_ON_HAND > 500) {
					MessageBox.show(
						"500 kg ve üzerindeki bobinler için tampon tüket işlemi yapamazsınız"
					);
					return;
				}

				// batch id tampon id ERP ile ortak olan id
				// ME tüketim yapılacak yer inventory id
				var inventoryId = selectedLine.INVENTORY_ID;
				var tamponBatchId = selectedLine.BATCH_ID;

				var response = TransactionCaller.async(
					"ECZ_MES-4.0/KAGIT/DM_MANAGEMENT/COMBINE_ORDER/TAMPON_FINISH_CONSUMPTION/T_MainTransactionTamponFinishConsumptions",
					{
						I_INVENTORY_ID: inventoryId,
						I_TAMPON_ID: tamponBatchId,
					},
					"O_JSON",
					this.onPressTamponConsumptionButtonCB,
					this,
					"GET"
				);
			},

			onPressTamponConsumptionButtonCB: function (iv_data, iv_scope) {
				if (iv_data[1] === "S") {
					iv_scope.getInventoryFromWorkCenter();
					MessageBox.show(iv_data[0]);
				} else {
					MessageBox.show(iv_data[0]);
				}
			},

			onPressManuelStockChangeButton: function (oEvent) {
				if (!this._oDialogStockChange) {
					this._oDialogStockChange = sap.ui.xmlfragment(
						"Z_StockChange",
						"customOrderScreen.view.fragments.stockChange",
						this
					);

					this.getView().addDependent(this._oDialogStockChange);
				}

				this._oDialogStockChange.open();

				var sIndex = oEvent.getSource().getParent().getIndex();
				var selectedLine = oEvent.getSource().getParent().getModel().getData()[
					sIndex
				];

				this.getCurrentStockFromInvId(selectedLine);
			},

			getCurrentStockFromInvId: function (selectedLine) {
				// batch id tampon id ERP ile ortak olan id
				// ME tüketim yapılacak yer inventory id
				var inventoryId = selectedLine.INVENTORY_ID;
				var tamponBatchId = selectedLine.BATCH_ID;

				sap.ui.core.Fragment.byId("Z_StockChange", "tamponIdField").setText(
					inventoryId
				);

				var response = TransactionCaller.async(
					"ECZ_MES-4.0/KAGIT/DM_MANAGEMENT/COMBINE_ORDER/tamponManuelStockIncrease/T_GetInventoryStockValue",
					{
						I_INV: inventoryId,
						I_WC: this.selectedWorkCenter,
					},
					"O_JSON",
					this.getCurrentStockFromInvIdCB,
					this,
					"GET"
				);
			},

			getCurrentStockFromInvIdCB: function (iv_data, iv_scope) {
				if (iv_data[1] === "S") {
					sap.ui.core.Fragment.byId(
						"Z_StockChange",
						"quantityFieldOld"
					).setValue(iv_data[0].Rowsets.Rowset.Row.QTY_ON_HAND * 1000);
				} else {
					MessageToast.show(iv_data[0]);
				}
			},

			onPresStockChangeSaveButton: function () {
				var response = TransactionCaller.async(
					"ECZ_MES-4.0/KAGIT/DM_MANAGEMENT/COMBINE_ORDER/tamponManuelStockIncrease/T_MainTransactionManuelStockChange",
					{
						I_INV: sap.ui.core.Fragment.byId(
							"Z_StockChange",
							"tamponIdField"
						).getText(),
						I_SITE: this.SITE,
						I_WC: this.selectedWorkCenter,
						I_ENTRY_QNT_NEW: sap.ui.core.Fragment.byId(
							"Z_StockChange",
							"quantityFieldNew"
						).getValue(),
						I_ENTRY_QNT_OLD: sap.ui.core.Fragment.byId(
							"Z_StockChange",
							"quantityFieldOld"
						).getValue(),
					},
					"O_JSON",
					this.onPresStockChangeSaveButtonCB,
					this,
					"GET"
				);
			},

			onPresStockChangeSaveButtonCB: function (iv_data, iv_scope) {
				if (iv_data[1] === "S") {
					iv_scope.getInventoryFromWorkCenter();
				}

				MessageToast.show(iv_data[0]);

				iv_scope._oDialogStockChange.close();
			},
			onPresStockChangeCancelButton: function () {
				this._oDialogStockChange.close();
			},

			setDragDropVisible: function () {
				this.setDragDropVisibleTrue();

				var tableIDs = [
					"firstLayerTable",
					"secondLayerTable",
					"thirdLayerTable",
					"fourthLayerTable",
				];
				tableIDs.slice(this.selectedOrderKatAdet).forEach((item) => {
					this.getView().byId(item).setVisible(false);
				}, this);
			},

			setDragDropVisibleTrue: function () {
				this.getView().byId("fourthLayerTable").setVisible(true);
				this.getView().byId("thirdLayerTable").setVisible(true);
				this.getView().byId("secondLayerTable").setVisible(true);
				this.getView().byId("firstLayerTable").setVisible(true);
			},
		});
	}
);
