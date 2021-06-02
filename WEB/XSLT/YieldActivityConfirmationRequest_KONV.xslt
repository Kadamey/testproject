<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

    <xsl:template match="/">
        <BAPI_PRODORDCONF_CREATE_TT >
            <xsl:for-each select="yieldActivityConfirmation_KONV/item">
                <item>
                    <site>
                        <xsl:value-of select="SITE"/>
                    </site>
                    <shopOrderNo>
                        <xsl:value-of select="SHOP_ORDER"/>
                    </shopOrderNo>
                    <quantity101>
                        <xsl:value-of select="QTY"/>
                    </quantity101>
                    <activityTime>
                        <xsl:value-of select="ACITIVITYMINUTES"/>
                    </activityTime>
<workCenter>
                        <xsl:value-of select="WORKCENTER"/>
                    </workCenter>
                  
                </item>
            </xsl:for-each>
        </BAPI_PRODORDCONF_CREATE_TT >

    </xsl:template>
</xsl:stylesheet>
