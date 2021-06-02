<?xml version='1.0' ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sch="http://sap.com/xi/ME" xmlns:ns1="http://sap.com/xi/ME" xmlns:gdt="http://sap.com/xi/SAPGlobal/GDT">
    <xsl:template match="/Z_CLFMAS02_SAVE_ITEM_CUST_FLDS">
        <soapenv:Envelope xmlns:me="http://sap.com/xi/ME" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
        <soapenv:Header/>
        <soapenv:Body>
        <sch:ItemUpdateCustomDataRequest_sync>
        <sch:UpdateCustomData>
            <sch:ItemRef>
                <xsl:variable name="objeckField" select="normalize-space(IDOC/E1OCLFM/OBJEK)" />
                <xsl:variable name="plant" select="normalize-space(IDOC/E1OCLFM/WERKS)"/>
                <sch:Item>
                    <xsl:call-template name="addItem">
                        <xsl:with-param name="item" select="normalize-space($objeckField)" />
                        <xsl:with-param name="itemExt" select="/Z_CLFMAS02_SAVE_ITEM_CUST_FLDS/IDOC/BAPI_MATERIAL_GETLIST/TABLES/MATNRLIST/item/MATERIAL_EXTERNAL" />
                        <xsl:with-param name="itemLong" select="/Z_CLFMAS02_SAVE_ITEM_CUST_FLDS/IDOC/E1OCLFM/OBJEK_LONG" />
                    </xsl:call-template>
                </sch:Item>
                <sch:SiteRef>
                    <sch:Site>
                        <xsl:value-of select="normalize-space($plant)" />
                    </sch:Site>
                </sch:SiteRef>
                <sch:Revision>#</sch:Revision>
            </sch:ItemRef>
            <sch:CustomFieldList>
                <xsl:for-each select="IDOC/E1OCLFM/E1AUSPM">
                    <sch:CustomField>
                        <sch:Attribute>
                            <xsl:value-of select="ATNAM" />
                        </sch:Attribute>
                        <sch:Value>
                        	<xsl:choose>
					            <xsl:when test="ATWRT_LONG!=''">
					            	<xsl:value-of select="ATWRT_LONG" />
					            </xsl:when>
					            <xsl:when test="ATWRT != ''">
					                <xsl:value-of select="ATWRT" />
					            </xsl:when>
                                <xsl:otherwise>
                        <xsl:call-template name="expo">
                        <xsl:with-param name="val" select="ATFLV" />
                        </xsl:call-template>
                                </xsl:otherwise>
					        </xsl:choose>
                        </sch:Value>
                    </sch:CustomField>
                </xsl:for-each>
            </sch:CustomFieldList>
        </sch:UpdateCustomData>
        </sch:ItemUpdateCustomDataRequest_sync>
        </soapenv:Body>
        </soapenv:Envelope>
    </xsl:template>
    
    <xsl:template name="addItem">
        <xsl:param name="item" />
        <xsl:param name="itemExt" />
        <xsl:param name="itemLong" />
        <xsl:variable name="itemString">
			<xsl:choose>
	            <xsl:when test="$itemExt!=''">
	            	<xsl:value-of select="normalize-space($itemExt)" />
	            </xsl:when>
	            <xsl:when test="$itemLong!=''">
	            	<xsl:value-of select="normalize-space($itemLong)" />
	            </xsl:when>
	            <xsl:otherwise>
	                <xsl:value-of select="normalize-space($item)" />
	            </xsl:otherwise>
	        </xsl:choose>
		</xsl:variable>
		<xsl:variable name="itemMask">
			<xsl:choose>
	            <xsl:when test="$itemExt!=''">
	            	<xsl:value-of select="'0000000000000000000000000000000000000000'"/>
	            </xsl:when>
	            <xsl:otherwise>
	                <xsl:value-of select="'000000000000000000'"/>
	            </xsl:otherwise>
            </xsl:choose>
		</xsl:variable>
        <xsl:variable name="itemNumber" select="string(number($itemString))"/>
        <xsl:choose>
            <xsl:when test="$itemNumber='NaN'">
                <xsl:value-of select="$itemString"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="format-number($itemNumber, $itemMask)"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
         <xsl:template name="expo">
        <xsl:param name="val" />
       <xsl:variable name="vExponent" select="substring-after($val,'E')"/>
        	<xsl:variable name="vMantissa" select="substring-before($val,'E')"/>
        	<xsl:variable name="vFactor"
        		select="substring('100000000000000000000000000000000000000000000',
        		1, substring($vExponent,2) + 1)"
        	/>
<xsl:choose>
			<xsl:when test="starts-with($vExponent,'-')">
				<xsl:value-of select="$vMantissa div $vFactor"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$vMantissa * $vFactor"/>
			</xsl:otherwise>
		</xsl:choose>
    </xsl:template>
    
</xsl:stylesheet>
