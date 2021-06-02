<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0"
    xmlns:me="http://sap.com/xi/ME">
    <xsl:output indent="yes" method="xml" />
    <xsl:template match="/">
        <DOCS>
            <xsl:variable name="currentPlant" select="substring(/CLFMAS02/IDOC/E1OCLFM/OBJEK,1,4)" />
            <xsl:call-template name="startDoc">
                <xsl:with-param name="plant" select="$currentPlant" />
            </xsl:call-template>
        </DOCS>
    </xsl:template>
    <xsl:template name="startDoc">
        <xsl:param name="plant" />
        <Z_CLFMAS02>
            <xsl:apply-templates select="//IDOC">
                <xsl:with-param name="plant" select="$plant" />
            </xsl:apply-templates>
            <Z_PARAM>
                <Name>
                    <xsl:value-of select="/CLFMAS02/IDOC/E1OCLFM/E1AUSPM/ATNAM"/>
                </Name>
                <Value>
                    <xsl:call-template name="expo">
                        <xsl:with-param name="val" select="/CLFMAS02/IDOC/E1OCLFM/E1AUSPM/ATFLV" />
                    </xsl:call-template>
                </Value>
            </Z_PARAM>



        </Z_CLFMAS02>

    </xsl:template>
    <xsl:template match="*">
        <xsl:param name="plant" />
        <xsl:copy>
            <xsl:apply-templates>
                <xsl:with-param name="plant" select="$plant" />
            </xsl:apply-templates>
        </xsl:copy>
    </xsl:template>
    <xsl:template match="EDI_DC40 ">
        <xsl:param name="plant" />
        <xsl:copy>
            <PLANT>
                <xsl:value-of select="$plant"/>
            </PLANT>
            <xsl:apply-templates />
        </xsl:copy>
    </xsl:template>
    <xsl:template match="DOCNUM">
        <xsl:param name="plant" />
        <DOCNUM>
            <xsl:value-of select="."/>
-            <xsl:value-of select="$plant"/>
        </DOCNUM>
    </xsl:template>

    <xsl:template name="expo">
        <xsl:param name="val" />
        <xsl:variable name="vExponent" select="substring-after($val,'E')"/>
        <xsl:variable name="vMantissa" select="substring-before($val,'E')"/>
        <xsl:variable name="vFactor" select="substring('100000000000000000000000000000000000000000000',
        		1, substring($vExponent,2) + 1)" />
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