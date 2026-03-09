package com.trackingapp.mobile

import android.content.Intent
import android.util.Log
import com.facebook.react.bridge.*
import android.app.Activity
import java.io.StringReader
import org.xmlpull.v1.XmlPullParser
import org.xmlpull.v1.XmlPullParserFactory

class MantraModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var mantraPromise: Promise? = null

    private val activityEventListener = object : BaseActivityEventListener() {
        override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
            if (requestCode == MANTRA_CAPTURE_REQUEST_CODE) {
                if (mantraPromise != null) {
                    if (resultCode == Activity.RESULT_OK) {
                        val result = data?.getStringExtra("PID_DATA")
                        if (result != null) {
                            val map = parseXml(result)
                            mantraPromise?.resolve(map)
                        } else {
                            mantraPromise?.reject("CAPTURE_ERROR", "No PID data received from Mantra RD Service")
                        }
                    } else {
                        mantraPromise?.reject("CAPTURE_CANCELLED", "User cancelled or capture failed")
                    }
                    mantraPromise = null
                }
            }
        }
    }

    init {
        reactContext.addActivityEventListener(activityEventListener)
    }

    override fun getName(): String {
        return "MantraModule"
    }

    @ReactMethod
    fun captureFingerprint(promise: Promise) {
        val currentActivity = currentActivity
        if (currentActivity == null) {
            promise.reject("ACTIVITY_ERROR", "Activity doesn't exist")
            return
        }

        mantraPromise = promise

        try {
            val intent = Intent("com.mantra.rdservice.CAPTURE")
            intent.setPackage("com.mantra.rdservice")
            
            // XML configuration for Mantra capture
            // fCount="1" means 1 finger
            // format="0" usually means XML
            val pidOption = "<?xml version=\"1.0\"?><PidOptions ver=\"1.0\"><Opts fCount=\"1\" fType=\"0\" iCount=\"\" iType=\"\" pCount=\"\" pType=\"\" format=\"0\" pidVer=\"2.0\" timeout=\"10000\" otp=\"\" wadh=\"\" posh=\"\"/></PidOptions>"
            
            intent.putExtra("PID_OPTIONS", pidOption)
            currentActivity.startActivityForResult(intent, MANTRA_CAPTURE_REQUEST_CODE)
        } catch (e: Exception) {
            mantraPromise?.reject("INTENT_ERROR", "Mantra RD Service not found or error occurred: ${e.message}")
            mantraPromise = null
        }
    }

    private fun parseXml(xmlData: String): WritableMap {
        val map = Arguments.createMap()
        try {
            val factory = XmlPullParserFactory.newInstance()
            val parser = factory.newPullParser()
            parser.setInput(StringReader(xmlData))
            var eventType = parser.eventType
            while (eventType != XmlPullParser.END_DOCUMENT) {
                if (eventType == XmlPullParser.START_TAG) {
                    val tagName = parser.name
                    if (tagName == "Resp") {
                        map.putString("errCode", parser.getAttributeValue(null, "errCode"))
                        map.putString("errInfo", parser.getAttributeValue(null, "errInfo"))
                        map.putString("nmPoints", parser.getAttributeValue(null, "nmPoints"))
                        map.putString("qScore", parser.getAttributeValue(null, "qScore"))
                    }
                }
                eventType = parser.next()
            }
            map.putString("rawXml", xmlData)
        } catch (e: Exception) {
            Log.e("MantraLog", "XML Parsing Error", e)
            map.putString("parseError", e.message)
        }
        return map
    }

    companion object {
        private const val MANTRA_CAPTURE_REQUEST_CODE = 456
    }
}
