<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sch="http://sap.com/xi/ME" xmlns:gdt="http://sap.com/xi/SAPGlobal/GDT">
	<xsl:template match="/">
		<xsl:apply-templates select="/Z_MATMAS05/IDOC/E1MARAM/E1MARCM"/>
	</xsl:template>
	<xsl:template match="/Z_MATMAS05/IDOC/E1MARAM/E1MARCM">
		<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
			<soapenv:Header/>
			<soapenv:Body>
				<sch:ItemUpdateRequest_sync>
					<sch:Item>
						<sch:SiteRef>
							<sch:Site>
								<xsl:value-of select="WERKS"/>
							</sch:Site>
						</sch:SiteRef>
						<sch:Item>
							<xsl:choose>
								<xsl:when test="(string(format-number( ../E1MARA1/MATNR_EXTERNAL, '0')))">
									<xsl:call-template name="addItem">
										<xsl:with-param name="item" select="format-number( ../E1MARA1/MATNR_EXTERNAL, '0')"/>
									</xsl:call-template>
								</xsl:when>
								<xsl:when test="(string(../MATNR_LONG))">
									<xsl:call-template name="addItem">
										<xsl:with-param name="item" select="../MATNR_LONG"/>
									</xsl:call-template>
								</xsl:when>
								<xsl:otherwise>
									<xsl:call-template name="addItem">
										<xsl:with-param name="item" select="format-number(../MATNR, '0')"/>
									</xsl:call-template>
								</xsl:otherwise>
							</xsl:choose>
						</sch:Item>
						<xsl:if test="(string(../REVLV))">
							<sch:Revision>
								<xsl:value-of select="../REVLV"/>
							</sch:Revision>
						</xsl:if>
						<sch:CurrentRevision>true</sch:CurrentRevision>
					    <sch:Origin>E</sch:Origin>
						<sch:Description>
							<xsl:choose>
								<xsl:when test="(string(../E1MAKTM[SPRAS=//SupportedPlant/Language]/MAKTX))">
									<xsl:value-of select="../E1MAKTM[SPRAS=//SupportedPlant/Language]/MAKTX"/>
								</xsl:when>
								<xsl:when test="(string(../E1MAKTM[SPRAS_ISO=//SupportedPlant/Language]/MAKTX))">
									<xsl:value-of select="../E1MAKTM[SPRAS_ISO=//SupportedPlant/Language]/MAKTX"/>
								</xsl:when>
								<xsl:otherwise>
									<xsl:value-of select="../E1MAKTM/MAKTX"/>
								</xsl:otherwise>
							</xsl:choose>
						</sch:Description>
						<sch:UnitOfMeasure>
							<xsl:value-of select="../MEINS"/>
						</sch:UnitOfMeasure>
						<sch:StatusRef>
							<sch:Status>201</sch:Status>
						</sch:StatusRef>
						<sch:EffectivityControl>R</sch:EffectivityControl>
						<xsl:variable name="configurable" select="//KZKFG"/>
						<xsl:variable name="materialType" select="../MTART"/>
						<xsl:variable name="procurementType" select="BESKZ"/>
						<xsl:choose>
							<xsl:when test="$configurable = 'X' and $materialType != ''">
								<sch:MaterialType>KMAT</sch:MaterialType>
							</xsl:when>
							<xsl:when test="$materialType = 'VERP' and not(string($configurable))">
								<sch:MaterialType>VERP</sch:MaterialType>
							</xsl:when>
							<xsl:when test="$materialType = 'FERT' and not(string($configurable))">
								<sch:MaterialType>FERT</sch:MaterialType>
							</xsl:when>
							<xsl:when test="$materialType = 'FHMI' and not(string($configurable))">
								<sch:MaterialType>FHMI</sch:MaterialType>
							</xsl:when>
							<xsl:when test="$materialType = 'ROH' and not(string($configurable))">
								<sch:MaterialType>ROH</sch:MaterialType>
							</xsl:when>
                            <xsl:when test="$materialType = 'ZROH' and not(string($configurable))">
								<sch:MaterialType>ROH</sch:MaterialType>
							</xsl:when>
							<xsl:when test="$materialType = 'HALB' and not(string($configurable))">
								<sch:MaterialType>HALB</sch:MaterialType>
							</xsl:when>
							<xsl:otherwise>
								<sch:MaterialType>CSTM</sch:MaterialType>
							</xsl:otherwise>
						</xsl:choose>
						<xsl:choose>
							<xsl:when test="$procurementType = 'E'">
								<sch:ProcurementType>M</sch:ProcurementType>
							</xsl:when>
							<xsl:when test="$procurementType = 'F'">
							<!--Arge malzemelerine sipariş açılabilmesi için   için procurement type P den M ye çevrildi 07042021-->
								<sch:ProcurementType>M</sch:ProcurementType>
							</xsl:when>
							<xsl:when test="$procurementType = 'X'">
								<sch:ProcurementType>B</sch:ProcurementType>
							</xsl:when>
							<xsl:otherwise>
								<sch:ProcurementType>B</sch:ProcurementType>
							</xsl:otherwise>
						</xsl:choose>
						<xsl:choose>
							<xsl:when test="string(normalize-space(LOT_SIZE))">
								<sch:LotSize>
									<xsl:value-of select="LOT_SIZE"/>
								</sch:LotSize>
							</xsl:when>
							<xsl:otherwise>
								<sch:LotSize>1</sch:LotSize>
							</xsl:otherwise>
						</xsl:choose>
						<sch:QuantityRestriction>A</sch:QuantityRestriction>
						<xsl:choose>
							<xsl:when test="../XCHPF='X'">
								<sch:IncrementBatchNumber>O</sch:IncrementBatchNumber>
							</xsl:when>
							<xsl:otherwise>
								<sch:IncrementBatchNumber>N</sch:IncrementBatchNumber>
							</xsl:otherwise>
						</xsl:choose>
						<xsl:choose>
							<xsl:when test="BESKZ = 'E'">
								<sch:ErpPutawayStorageLocation>
									<xsl:value-of select="LGPRO"/>
								</sch:ErpPutawayStorageLocation>
							</xsl:when>
							<xsl:when test="BESKZ = 'F'">
								<sch:StorageLocationRef>
									<sch:StorageLocation>
										<xsl:value-of select="LGPRO"/>
									</sch:StorageLocation>
								</sch:StorageLocationRef>
							</xsl:when>
							<xsl:otherwise>
								<sch:ErpPutawayStorageLocation>
									<xsl:value-of select="LGPRO"/>
								</sch:ErpPutawayStorageLocation>
								<sch:StorageLocationRef>
									<sch:StorageLocation>
										<xsl:value-of select="LGPRO"/>
									</sch:StorageLocation>
								</sch:StorageLocationRef>
							</xsl:otherwise>
						</xsl:choose>
						<xsl:choose>
							<xsl:when test="RGEKZ=1">
								<sch:ErpBackflushing>true</sch:ErpBackflushing>
							</xsl:when>
							<xsl:otherwise>
								<sch:ErpBackflushing>false</sch:ErpBackflushing>
							</xsl:otherwise>
						</xsl:choose>
						<xsl:choose>
							<xsl:when test="string(normalize-space(//EAN11))">
								<sch:ErpGTIN>
									<xsl:value-of select="//EAN11"/>
								</sch:ErpGTIN>
							</xsl:when>
						</xsl:choose>
						<sch:ProductionSupplyArea>
							<xsl:value-of select="VSPVB"/>
						</sch:ProductionSupplyArea>
						<sch:AssignSerialAtRelease>true</sch:AssignSerialAtRelease>
						<sch:AssyDataTypeRef>
							<sch:AssyDataType>NONE</sch:AssyDataType>
						</sch:AssyDataTypeRef>
						<sch:InventoryAssyDataTypeRef>
							<sch:AssyDataType>NONE</sch:AssyDataType>
						</sch:InventoryAssyDataTypeRef>
						<sch:RemovalAssyDataTypeRef>
							<sch:AssyDataType>NONE</sch:AssyDataType>
						</sch:RemovalAssyDataTypeRef>
						<sch:PreAssembled>false</sch:PreAssembled>
						<xsl:if test="string(../E1MAKTM/MAKTX)">
							<sch:ItemTranslationList>
								<xsl:for-each select="../E1MAKTM">
									<sch:ItemTranslation>
										<sch:Locale>
											<xsl:call-template name="toLowerCase">
												<xsl:with-param name="str" select="SPRAS_ISO"/>
											</xsl:call-template>
										</sch:Locale>
										<sch:Description>
											<xsl:value-of select="MAKTX"/>
										</sch:Description>
									</sch:ItemTranslation>
								</xsl:for-each>
							</sch:ItemTranslationList>
						</xsl:if>
					</sch:Item>
				</sch:ItemUpdateRequest_sync>
			</soapenv:Body>
		</soapenv:Envelope>
	</xsl:template>
	<xsl:template name="addItem">
		<xsl:param name="item"/>
		<xsl:variable name="itemString" select="normalize-space($item)"/>
		<xsl:value-of select="$itemString"/>
	</xsl:template>
	<xsl:template name="toLowerCase">
		<xsl:param name="str"/>
		<xsl:variable name="lowerCaseAlphabet">abcdefghijklmnopqrstuvwxyz</xsl:variable>
		<xsl:variable name="upperCaseAlphabet">ABCDEFGHIJKLMNOPQRSTUVWXYZ</xsl:variable>
		<xsl:value-of select="translate($str,$upperCaseAlphabet,$lowerCaseAlphabet)"/>
	</xsl:template>
</xsl:stylesheet>