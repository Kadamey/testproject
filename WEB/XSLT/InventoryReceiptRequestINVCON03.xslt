<?xml version='1.0' ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sch="http://sap.com/xi/ME" xmlns:gdt="http://sap.com/xi/SAPGlobal/GDT">
    <xsl:template match="/">
    <xsl:apply-templates select="//E1ICHD0"/>
    </xsl:template>
    <xsl:template match="//E1ICHD0">
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
        <soapenv:Header/>
        <soapenv:Body>
	        <sch:InventoryReceiptRequest_sync>
	            <sch:InventoryReceiptRequest>
		             <sch:SiteRef>
		                 <sch:Site>
		                     <xsl:value-of select="E1ICIT0/WERKS[1]"/>
		                 </sch:Site>
		             </sch:SiteRef>
		             <xsl:for-each select="E1ICIT0">
		                 <xsl:choose>
		                     <xsl:when test="BWART='261' or (BWART='311' and SHKZG = 'S')">
		               	<!--	<xsl:variable name="invID">
		                          <xsl:call-template name="addInvId">
		                                 <xsl:with-param name="matDocYear" select="../MJAHR"/>
		                                 <xsl:with-param name="matDocNum" select="../MBLNR"/>
		                                 <xsl:with-param name="lineNum" select="ZEILE"/>
		                                 <xsl:with-param name="matNum" select="MATNR"/> 
		                                 <xsl:with-param name="longMatNum" select="MATNR_EXTERNAL"/> 
		                             </xsl:call-template>
		                         </xsl:variable>   -->
								 
		                         <sch:InventoryReceipt>
		                             <sch:SiteRef>
		                                 <sch:Site>
		                                     <xsl:value-of select="WERKS"/>
		                                 </sch:Site>
		                             </sch:SiteRef>
		              		  <!--	<sch:InventoryId>
		                                 <xsl:value-of select="$invID"/>
		                             </sch:InventoryId>		-->
		                             <sch:ItemRef>
		                                 <sch:Item>
		                                     <xsl:choose>
									            <xsl:when test="MATNR_EXTERNAL">
									            	<xsl:value-of select="MATNR_EXTERNAL"/>
									            </xsl:when>
									            <xsl:when test="E1ICIT5/MATNR_LONG">
									            	<xsl:value-of select="E1ICIT5/MATNR_LONG"/>
									            </xsl:when>
									            <xsl:otherwise>
									                <xsl:value-of select="MATNR"/>
									            </xsl:otherwise>
									        </xsl:choose>
		                                 </sch:Item>
		                                 <sch:Revision>#</sch:Revision>
		                             </sch:ItemRef>
		                             <sch:QuantityOnHand>
		                                 <xsl:value-of select="MENGE"/>
		                             </sch:QuantityOnHand>
		                             <sch:ErpInventory>true</sch:ErpInventory>
									 <xsl:if test="BWART='261'">
		                                 <xsl:variable name="POValue" select="AUFNR"/>
		                                 <sch:ShopOrderLocRef>
		                                     <sch:ShopOrder>
		                                         <xsl:call-template name="addShopOrder">
		                                             <xsl:with-param name="shopOrder" select="$POValue"/>
		                                         </xsl:call-template>
		                                     </sch:ShopOrder>
		                                 </sch:ShopOrderLocRef>
		                                 <sch:ShopOrderLocRes>true</sch:ShopOrderLocRes>
		                                 <sch:ShopOrderSetByErp>true</sch:ShopOrderSetByErp>
                                         <xsl:if test="string(LGORT)">
                                             <sch:InventoryAssyData>
                                             <!--    <sch:InventoryRef>
                                                     <sch:InventoryId>
                                                         <xsl:value-of select="$invID"/>
                                                     </sch:InventoryId> 
                                                 </sch:InventoryRef> -->
                                                 <sch:Sequence>1</sch:Sequence>
                                                 <sch:DataAttribute><xsl:value-of select="LGORT"/></sch:DataAttribute>
                                                 <sch:DataField>CENTRAL_STORAGE_LOCATION</sch:DataField>
                                             </sch:InventoryAssyData>
											  <sch:InventoryAssyData>
                                    <!--         <sch:InventoryRef>
                                                 <sch:InventoryId>
                                                     <xsl:value-of select="$invID"/>
                                                 </sch:InventoryId>
                                             </sch:InventoryRef> -->
                                             <sch:Sequence>10</sch:Sequence>
                                             <sch:DataField>MAT_DOC_YEAR</sch:DataField>
                                             <sch:DataAttribute><xsl:value-of select="../MJAHR"/></sch:DataAttribute>
                                         </sch:InventoryAssyData>
										 <sch:InventoryAssyData>
                                    <!--         <sch:InventoryRef>
                                                 <sch:InventoryId>
                                                     <xsl:value-of select="$invID"/>
                                                 </sch:InventoryId>
                                             </sch:InventoryRef> -->
                                             <sch:Sequence>20</sch:Sequence>
                                             <sch:DataField>MAT_DOC_NUM</sch:DataField>
                                             <sch:DataAttribute><xsl:value-of select="../MBLNR"/></sch:DataAttribute>
                                         </sch:InventoryAssyData>
										 <sch:InventoryAssyData>
                                    <!--         <sch:InventoryRef>
                                                 <sch:InventoryId>
                                                     <xsl:value-of select="$invID"/>
                                                 </sch:InventoryId>
                                             </sch:InventoryRef> -->
                                             <sch:Sequence>30</sch:Sequence>
                                             <sch:DataField>LINE_NUM</sch:DataField>
                                             <sch:DataAttribute><xsl:value-of select="ZEILE"/></sch:DataAttribute>
                                         </sch:InventoryAssyData>
                                         </xsl:if>
		                             </xsl:if>
		                             <xsl:if test="BWART='311'">
                                         <xsl:if test="string(LGORT)">
                                             <sch:StorageLocationRef>
                                                 <sch:StorageLocation>
                                                     <xsl:value-of select="LGORT"/>
                                                 </sch:StorageLocation>
                                             </sch:StorageLocationRef>
                                         </xsl:if>
		                                 <xsl:if test="string(UMLGO)">
		                                     <sch:InventoryAssyData>
		                                      <!--   <sch:InventoryRef>
		                                             <sch:InventoryId>
		                                                 <xsl:value-of select="$invID"/>
		                                             </sch:InventoryId>
		                                         </sch:InventoryRef> -->
		                                         <sch:Sequence>1</sch:Sequence>
		                                         <sch:DataAttribute><xsl:value-of select="UMLGO"/></sch:DataAttribute>
		                                         <sch:DataField>CENTRAL_STORAGE_LOCATION</sch:DataField>
		                                     </sch:InventoryAssyData>
											  <sch:InventoryAssyData>
                                    <!--         <sch:InventoryRef>
                                                 <sch:InventoryId>
                                                     <xsl:value-of select="$invID"/>
                                                 </sch:InventoryId>
                                             </sch:InventoryRef> -->
                                             <sch:Sequence>10</sch:Sequence>
                                             <sch:DataField>MAT_DOC_YEAR</sch:DataField>
                                             <sch:DataAttribute><xsl:value-of select="../MJAHR"/></sch:DataAttribute>
                                         </sch:InventoryAssyData>
										 <sch:InventoryAssyData>
                                    <!--         <sch:InventoryRef>
                                                 <sch:InventoryId>
                                                     <xsl:value-of select="$invID"/>
                                                 </sch:InventoryId>
                                             </sch:InventoryRef> -->
                                             <sch:Sequence>20</sch:Sequence>
                                             <sch:DataField>MAT_DOC_NUM</sch:DataField>
                                             <sch:DataAttribute><xsl:value-of select="../MBLNR"/></sch:DataAttribute>
                                         </sch:InventoryAssyData>
										 <sch:InventoryAssyData>
                                    <!--         <sch:InventoryRef>
                                                 <sch:InventoryId>
                                                     <xsl:value-of select="$invID"/>
                                                 </sch:InventoryId>
                                             </sch:InventoryRef> -->
                                             <sch:Sequence>30</sch:Sequence>
                                             <sch:DataField>LINE_NUM</sch:DataField>
                                             <sch:DataAttribute><xsl:value-of select="ZEILE"/></sch:DataAttribute>
                                         </sch:InventoryAssyData>
		                                 </xsl:if>
		                             </xsl:if>
		                             <xsl:if test="string(CHARG)">
                                         <sch:InventoryAssyData>
                                    <!--         <sch:InventoryRef>
                                                 <sch:InventoryId>
                                                     <xsl:value-of select="$invID"/>
                                                 </sch:InventoryId>
                                             </sch:InventoryRef> -->
                                             <sch:Sequence>1</sch:Sequence>
                                             <sch:DataField>BATCH_NUMBER</sch:DataField>
                                             <sch:DataAttribute><xsl:value-of select="CHARG"/></sch:DataAttribute>
                                         </sch:InventoryAssyData>
										  
                                         <xsl:if test="string(BATCHATTRIBUTES/VENDOR_NO)">
                                             <sch:InventoryAssyData>
                                         <!--        <sch:InventoryRef>
                                                     <sch:InventoryId>
                                                         <xsl:value-of select="$invID"/>
                                                     </sch:InventoryId>
                                                 </sch:InventoryRef> -->
                                                 <sch:Sequence>1</sch:Sequence>
                                                 <sch:DataField>VENDOR</sch:DataField>
                                                 <sch:DataAttribute><xsl:value-of select="BATCHATTRIBUTES/VENDOR_NO"/></sch:DataAttribute>
                                             </sch:InventoryAssyData>
                                         </xsl:if>
                                         <xsl:if test="string(BATCHATTRIBUTES/VENDRBATCH)">
                                             <sch:InventoryAssyData>
                                         <!--        <sch:InventoryRef>
                                                     <sch:InventoryId>
                                                         <xsl:value-of select="$invID"/>
                                                     </sch:InventoryId>
                                                 </sch:InventoryRef> -->
                                                 <sch:Sequence>1</sch:Sequence>
                                                 <sch:DataField>VENDOR_LOT</sch:DataField>
                                                 <sch:DataAttribute><xsl:value-of select="BATCHATTRIBUTES/VENDRBATCH"/></sch:DataAttribute>
                                             </sch:InventoryAssyData>
                                         </xsl:if>
                                         <xsl:if test="string(BATCHATTRIBUTES/PROD_DATE)">
                                             <sch:InventoryAssyData>
                                            <!--     <sch:InventoryRef>
                                                     <sch:InventoryId>
                                                         <xsl:value-of select="$invID"/>
                                                     </sch:InventoryId>
                                                 </sch:InventoryRef> -->
                                                 <sch:Sequence>1</sch:Sequence>
                                                 <sch:DataField>VENDOR_DATE_CODE</sch:DataField>
                                                 <sch:DataAttribute><xsl:value-of select="BATCHATTRIBUTES/PROD_DATE"/></sch:DataAttribute>
                                             </sch:InventoryAssyData>
                                         </xsl:if>
                                         <xsl:for-each select="CLASSIFICATION/item">
                                             <sch:InventoryAssyData>
                                              <!--   <sch:InventoryRef>
                                                     <sch:InventoryId>
                                                         <xsl:value-of select="$invID"/>
                                                     </sch:InventoryId>
                                                 </sch:InventoryRef> -->
                                                 <sch:Sequence>1</sch:Sequence>
                                                 <sch:DataField>
                                                     <xsl:value-of select="ATNAM"/>
                                                 </sch:DataField>
                                                 <sch:DataAttribute>
                                                     <xsl:value-of select="ATWRT"/>
                                                 </sch:DataAttribute>
                                             </sch:InventoryAssyData>
                                         </xsl:for-each>
		                             </xsl:if>
		                         </sch:InventoryReceipt>
		                     </xsl:when>
		                 </xsl:choose>
		             </xsl:for-each>
	            </sch:InventoryReceiptRequest>
	        </sch:InventoryReceiptRequest_sync>
        </soapenv:Body>
        </soapenv:Envelope>
    </xsl:template>
    <xsl:template name="addInvId">
    	<xsl:param name="matDocYear"/>
        <xsl:param name="matDocNum"/>
        <xsl:param name="lineNum"/>
        <xsl:param name="matNum"/>
        <xsl:param name="longMatNum"/>
        <xsl:variable name="material">
	        <xsl:choose>
	            <xsl:when test="$longMatNum!=''">
	                <xsl:value-of select="$longMatNum"/>
	            </xsl:when>
	            <xsl:otherwise>
	                <xsl:value-of select="$matNum"/>
	            </xsl:otherwise>
	        </xsl:choose>
        </xsl:variable>
        <xsl:value-of select="concat($matDocYear,'-',$matDocNum,'-',$lineNum,'-',$material)"/>
	</xsl:template>
    <xsl:template name="addShopOrder">
        <xsl:param name="shopOrder"/>
        <xsl:variable name="shopOrderString" select="normalize-space($shopOrder)"/>
        <xsl:variable name="shopOrderNumber" select="format-number(number($shopOrderString), '#')"/>
        <xsl:choose>
            <xsl:when test="$shopOrderNumber='NaN'">
                <xsl:value-of select="$shopOrderString"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$shopOrderNumber"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
</xsl:stylesheet>