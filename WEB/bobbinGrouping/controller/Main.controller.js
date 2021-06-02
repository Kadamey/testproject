sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
    "bobbinGrouping/scripts/transactionCaller",
  ],
  function (
    Controller,
    JSONModel,
    MessageToast,
    Fragment,
    MessageBox,
    Dialog,
    DialogType,
    Button,
    ButtonType,
    TransactionCaller
  ) {
    "use strict";
    //var that, sPath, line, unit;
    var myModel;
    return Controller.extend("bobbinGrouping.controller.Main", {
      onInit: function () {
        this.getBobbinDetails();
      },

      getBobbinDetails: function () {
        var response = TransactionCaller.async(
          "ECZ_MES-4.0/LGV/GRUPLAMA/T_GetBobbinDetails",
          {},
          "O_JSON",
          this.getBobbinDetailsCB,
          this,
          "GET",
          {}
        );
      },

      _modelFormatter: function (iv_data) {
        var myModel = new sap.ui.model.json.JSONModel();
        myModel.setSizeLimit(10000);
        if (Array.isArray(iv_data[0].Rowsets.Rowset.Row)) {
          myModel.setData(iv_data[0]);
        } else {
          var obj_iv_data = iv_data[0];
          var dummyData = [];
          dummyData.push(iv_data[0].Rowsets.Rowset.Row);
          obj_iv_data.Rowsets.Rowset.Row = dummyData;
          myModel.setData(obj_iv_data);
        }
        return myModel;
      },

      getBobbinDetailsCB: function (iv_data, iv_scope) {
        var myModel = iv_scope._modelFormatter(iv_data);
        iv_scope.getView().byId("idBobbinTable").setModel(myModel);
      },

      ResourceBundle: function (iv_id) {
        var oBundle = this.getView().getModel("i18n").getResourceBundle();
        var txt = oBundle.getText(iv_id);
        return txt;
      },

      onPressCreateButton: function (oEvent) {
        var jsonData = [];
        var selectedIndex;
        var tableObj = this.getView().byId("idBobbinTable");
        if (tableObj.getSelectedContextPaths().length <= 0) {
          MessageToast.show("Lütfen satır seçiniz");
          return;
        }
        var targetGroupTotal = 0;
        tableObj.getSelectedContextPaths().forEach((item, index) => {
          selectedIndex = item.substr(item.lastIndexOf("/") + 1);
          targetGroupTotal += Number(
            tableObj.getModel().getData().Rowsets.Rowset.Row[selectedIndex].EBAT
          );
        }, this);
        if (targetGroupTotal > 280) {
          MessageToast.show("Toplam ebat 2.8 metreyi geçemez.");
          return;
        }
        var errorState = false;
        tableObj.getSelectedContextPaths().forEach((item, index) => {
          selectedIndex = item.substr(item.lastIndexOf("/") + 1);
          if (
            !!tableObj.getModel().getData().Rowsets.Rowset.Row[selectedIndex]
              .GROUPNO
          ) {
            errorState = true;
          }
        }, this);

        if (errorState) {
          MessageToast.show("Gruplanmış bobin tekrar gruplanamaz.");
          return;
        }
        var response = TransactionCaller.sync(
          "ECZ_MES-4.0/LGV/GRUPLAMA/T_NextGroupId",
          {},
          "O_NEXTGROUPID"
        );

        if (response[1] == "E") {
          MessageBox.show("Hata mesaji: " + response[0]);
          return;
        }

        tableObj.getSelectedContextPaths().forEach((item, index) => {
          selectedIndex = item.substr(item.lastIndexOf("/") + 1);
          tableObj.getModel().getData().Rowsets.Rowset.Row[
            selectedIndex
          ].GROUPNO = response[0];
        }, this);

        tableObj.getModel().refresh();
      },

      onPressDeleteButton: function (oEvent) {
        var jsonData = [];
        var selectedIndex;
        var tableObj = this.getView().byId("idBobbinTable");
        var length = tableObj.getSelectedContextPaths().length;
        if (length <= 0) {
          MessageToast.show("Lütfen satır seçiniz");
          return;
        }
        tableObj.getSelectedContextPaths().forEach((item, index) => {
          jsonData.push(
            tableObj.getModel().getData().Rowsets.Rowset.Row[
              item.substr(item.lastIndexOf("/") + 1)
            ]
          );
          selectedIndex = item.substr(item.lastIndexOf("/") + 1);
          tableObj.getModel().getData().Rowsets.Rowset.Row[
            selectedIndex
          ].GROUPNO = "";
        }, this);
        tableObj.getModel().refresh();
      },

      onPressAddButton: function (oEvent) {
        var jsonData = [];
        var selectedIndex;
        var tableObj = this.getView().byId("idBobbinTable");

        if (tableObj.getSelectedContextPaths().length <= 0) {
          MessageToast.show("Lütfen eklemek istediğiniz satırı seçiniz");
          return;
        }

        var oView = this.getView();

        // create dialog lazily
        if (!this.pDialog) {
          this.pDialog = Fragment.load({
            id: oView.getId(),
            name: "bobbinGrouping.view.addGroupNoDialog",
            controller: this,
          }).then(function (oDialog) {
            // connect dialog to the root view of this component (models, lifecycle)
            oView.addDependent(oDialog);
            return oDialog;
          });
        }

        this.pDialog.then(function (oDialog) {
          oDialog.open();
        });

        var uniqueArray = [];
        tableObj
          .getModel()
          .getData()
          .Rowsets.Rowset.Row.forEach((item, index) => {
            if (!uniqueArray.includes(Number(item.GROUPNO)) && !!item.GROUPNO) {
              uniqueArray.push(Number(item.GROUPNO));
            }
          }, this);

        var dataObject = { Rowsets: { Rowset: { Row: [] } } };
        uniqueArray.forEach((item) => {
          dataObject.Rowsets.Rowset.Row.push({ BOBBINGROUP: item });
        }, this);
        var myModel = new sap.ui.model.json.JSONModel();
        myModel.setData(dataObject);

        this.byId("idLineComboBox").setModel(myModel);
      },

      onPressDeleteGroup: function (oEvent) {
        var jsonData = [];
        var selectedIndex;
        var tableObj = this.getView().byId("idBobbinTable");
        var length = tableObj.getSelectedContextPaths().length;
        var selectedIndex = tableObj.getSelectedContextPaths();
        var index = selectedIndex[0].split("/")[4];
        if (
          length <= 0 ||
          this.getView().byId("idBobbinTable").getModel().getData().Rowsets
            .Rowset.Row[index].GROUPNO == "" ||
          this.getView().byId("idBobbinTable").getModel().getData().Rowsets
            .Rowset.Row[index].GROUPNO == undefined ||
          this.getView().byId("idBobbinTable").getModel().getData().Rowsets
            .Rowset.Row[index].GROUPNO == null
        ) {
          MessageToast.show(
            "Lütfen silmek istediğiniz grubun olduğu bir satır seçiniz"
          );
        } else {
          var tableLength = this.getView()
            .byId("idBobbinTable")
            .getModel()
            .getData().Rowsets.Rowset.Row.length;
          var index = selectedIndex[0].split("/")[4];
          var selectedGroupNo = this.getView()
            .byId("idBobbinTable")
            .getModel()
            .getData().Rowsets.Rowset.Row[index].GROUPNO;

          jQuery.sap.require("sap.m.MessageBox");

          sap.m.MessageBox.show(
            selectedGroupNo + " No'lu grup silinecektir.Onaylıyor musunuz?",
            {
              icon: sap.m.MessageBox.Icon.WARNING,
              title: "UYARI",
              actions: [
                sap.m.MessageBox.Action.OK,
                sap.m.MessageBox.Action.CANCEL,
              ],
              onClose: function (oAction) {
                if (oAction == "OK") {
                  this.onPressDeleteGroupCB();
                }
              }.bind(this),
            }
          );
        }
      },

      onPressDeleteGroupCB: function (oEvent) {
        // var jsonData = [];
        var selectedIndex;
        var length = this.getView()
          .byId("idBobbinTable")
          .getSelectedContextPaths().length;
        var selectedIndex = this.getView()
          .byId("idBobbinTable")
          .getSelectedContextPaths();

        //                 if (length <= 0) {
        //     MessageToast.show("Lütfen silmek istediğiniz grubun olduğu bir satır seçiniz");
        // }else{
        var tableLength = this.getView()
          .byId("idBobbinTable")
          .getModel()
          .getData().Rowsets.Rowset.Row.length;
        var index = selectedIndex[0].split("/")[4];
        var selectedGroupNo = this.getView()
          .byId("idBobbinTable")
          .getModel()
          .getData().Rowsets.Rowset.Row[index].GROUPNO;

        for (var i = 0; i < tableLength; i++) {
          if (
            this.getView()
              .byId("idBobbinTable")
              .getModel()
              .getData()
              .Rowsets.Rowset.Row[i].hasOwnProperty("GROUPNO")
          ) {
            if (
              this.getView().byId("idBobbinTable").getModel().getData().Rowsets
                .Rowset.Row[i].GROUPNO != "" &&
              this.getView().byId("idBobbinTable").getModel().getData().Rowsets
                .Rowset.Row[i].GROUPNO != undefined &&
              this.getView().byId("idBobbinTable").getModel().getData().Rowsets
                .Rowset.Row[i].GROUPNO != null
            ) {
              var groupNo = this.getView()
                .byId("idBobbinTable")
                .getModel()
                .getData().Rowsets.Rowset.Row[i].GROUPNO;
              if (groupNo == selectedGroupNo) {
                this.getView()
                  .byId("idBobbinTable")
                  .getModel()
                  .getData().Rowsets.Rowset.Row[i].GROUPNO = "";
                var myModel = new sap.ui.model.json.JSONModel();
                myModel.setData(
                  this.getView().byId("idBobbinTable").getModel().getData()
                );
                this.getView().byId("idBobbinTable").setModel(myModel);
                this.getView().byId("idBobbinTable").removeSelections();
              } else {
                var msg = "mesaj";
              }
            }
          }

          // }
        }
      },

      handleAddConfirm: function () {
        var groupObj = this.byId("idLineComboBox");
        var jsonData = [];
        var selectedIndex;
        var tableObj = this.getView().byId("idBobbinTable");

        var targetGroup = groupObj.getSelectedKey();
        var targetGroupTotal = 0;

        tableObj
          .getModel()
          .getData()
          .Rowsets.Rowset.Row.forEach((item) => {
            if (targetGroup == item.GROUPNO) {
              targetGroupTotal += Number(item.EBAT);
            }
          }, this);

        tableObj.getSelectedContextPaths().forEach((item, index) => {
          selectedIndex = item.substr(item.lastIndexOf("/") + 1);
          targetGroupTotal += Number(
            tableObj.getModel().getData().Rowsets.Rowset.Row[selectedIndex].EBAT
          );
        }, this);

        if (targetGroupTotal > 280) {
          MessageToast.show("Toplam ebat 2.8 metreyi geçemez.");
          return;
        }

        tableObj.getSelectedContextPaths().forEach((item, index) => {
          selectedIndex = item.substr(item.lastIndexOf("/") + 1);
          tableObj.getModel().getData().Rowsets.Rowset.Row[
            selectedIndex
          ].GROUPNO = groupObj.getSelectedKey();
        }, this);

        tableObj.getModel().refresh();
        groupObj.setValue("");
        this.onCloseDialog();
      },

      onCloseDialog: function () {
        this.byId("addGroupNoDialog").close();
      },

      onPressSaveButton: function (oEvent) {
        var jsonData = [];
        var selectedIndex;
        var selectedPath = this.getView()
          .byId("idBobbinTable")
          .getSelectedContextPaths()[0];

        var selectedGroupNo = "";
		var errorState = false;
        this.getView().byId("idBobbinTable").getSelectedContextPaths().forEach((item) => {
            var currentGroup = this.getView().byId("idBobbinTable").getModel().getData(0).Rowsets.Rowset.Row[item.substr(item.lastIndexOf("/") + 1)].GROUPNO;
            
			if (!selectedGroupNo && !!currentGroup) {
              selectedGroupNo = currentGroup;
            } 
			else if ((selectedGroupNo != currentGroup) && !!currentGroup) {
				errorState = true;
            }
          }, this);

		  if(errorState){
			MessageToast.show("Sadece bir grup gönderilebilir.");
			return;
		  }
		  /*
        var selectedGroupNo = this.getView()
          .byId("idBobbinTable")
          .getModel()
          .getData(0).Rowsets.Rowset.Row[
          selectedPath.substr(selectedPath.lastIndexOf("/") + 1)
        ].GROUPNO;
		*/
        if (!selectedGroupNo) {
          MessageToast.show("Grubu olan bobinler için gönderim yapılabilir.");
          return;
        }

        var tableLength = this.getView()
          .byId("idBobbinTable")
          .getModel()
          .getData().Rowsets.Rowset.Row.length;
        for (var i = 0; i < tableLength; i++) {
          if (
            this.getView()
              .byId("idBobbinTable")
              .getModel()
              .getData()
              .Rowsets.Rowset.Row[i].hasOwnProperty("GROUPNO")
          ) {
            if (
              this.getView().byId("idBobbinTable").getModel().getData().Rowsets
                .Rowset.Row[i].GROUPNO != "" &&
              this.getView().byId("idBobbinTable").getModel().getData().Rowsets
                .Rowset.Row[i].GROUPNO != undefined &&
              this.getView().byId("idBobbinTable").getModel().getData().Rowsets
                .Rowset.Row[i].GROUPNO != null
            ) {
              var groupNo = this.getView()
                .byId("idBobbinTable")
                .getModel()
                .getData().Rowsets.Rowset.Row[i].GROUPNO;
              if (groupNo == selectedGroupNo) {
                jsonData.push(
                  this.getView().byId("idBobbinTable").getModel().getData()
                    .Rowsets.Rowset.Row[i]
                );
              }
            }
          }
        }

        /*
                  this.getView().byId("idBobbinTable").getSelectedContextPaths().forEach((item, index) => {
                      jsonData.push(this.getView().byId("idBobbinTable").getModel().getData(0).Rowsets.Rowset.Row[item.substr(item.lastIndexOf("/") + 1)]);
                  }, this);
                  */

        var response = TransactionCaller.sync(
          "ECZ_MES-4.0/LGV/GRUPLAMA/T_GroupNowithBobbinID",
          {
            I_jsonData: JSON.stringify(jsonData),
          },
          "O_JSON"
        );

        if (response[1] == "E") {
          MessageBox.show("Hata mesaji: " + response[0]);
        } else {
          var Msg = "Başarılı";
          MessageToast.show(Msg);
          this.getBobbinDetails();
        }
      },
    });
  }
);
