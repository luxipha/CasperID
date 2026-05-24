import 'dart:convert';
import 'dart:developer';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/views/pages/register_module/register_phone_number/register_phone_number_page.dart';
import 'package:meta/meta.dart';

import 'package:http/http.dart' as http;

import 'app_exception.dart';

class ApiService {
// developer url
  //static String _baseUrl = "http://47.107.108.223/";
  // static String _baseUrl = "https://mobapis.adevar.app/";
  static String _baseUrl = "https://mobapis.adevar.app/";

  static Uri _getUrl(String methodName) {
    return Uri.parse(_baseUrl + methodName);
  }

  /// GET
  static Future<dynamic> get(String url,
      {Map<String, String>? headerMap}) async {
    dynamic responseJson;
    print(_getUrl(url));

    try {
      var response;
      if (headerMap == null) {
        response = await http.get(_getUrl(url));
      } else {
        response = await http.get(_getUrl(url), headers: headerMap);
      }
      responseJson = returnResponse(response);
    } on SocketException {
      throw FetchDataException('No Internet Connection');
    }
    return responseJson;
  }

  /// GET WITH QUERY PARAMETERS

  static Future<dynamic> getWithQueryParameters(
      String url, Map<String, dynamic> params,
      {Map<String, String>? headerMap}) async {
    dynamic responseJson;
    print(_getUrl(url));
    print(headerMap);
    try {
      var response;
      final uri = Uri.http("mobapis.adevar.app", url, params);
      if (headerMap == null) {
        response = await http.get(uri);
      } else {
        response = await http.get(uri, headers: headerMap);
      }
      responseJson = returnResponse(response);
    } on SocketException {
      throw FetchDataException('No Internet Connection');
    }
    return responseJson;
  }

  /// POST
  static Future<dynamic> post(String url,
      {Map<String, dynamic>? params, Map<String, String>? headerMap}) async {
    dynamic responseJson;
    print(_getUrl(url));
    String jsonToBeSent = json.encode(params);
    print(jsonToBeSent);
    try {
      if (params == null) {
        throw FetchDataException('Parameters cannot be null');
      }
      var response;
      if (headerMap == null) {
        response = await http.post(
          _getUrl(url),
          body: jsonToBeSent,
        );
      } else {
        response = await http.post(
          _getUrl(url),
          headers: headerMap,
          body: jsonToBeSent,
        );
      }
      /*var response = await http.post(_getUrl(url),
          body: params, headers: headerMap != null ? headerMap : appHeaderMap);*/

      responseJson = returnResponse(response);
    } on SocketException {
      throw FetchDataException('No Internet Connection');
    }
    return responseJson;
  }

  ///  PUT
  static Future<dynamic> put(String url,
      {Map<String, String>? params,
      String? body,
      Map<String, String>? headerMap}) async {
    dynamic responseJson;
    print(_getUrl(url));
    try {
      var response;

      if (params == null && body == null) {
        response = await http.put(_getUrl(url), headers: headerMap);
      }

      if (body != null) {
        response = await http.put(_getUrl(url), body: body, headers: headerMap);
      } else if (params != null) {
        response =
            await http.put(_getUrl(url), body: params, headers: headerMap);
      }
      log('${response.body}');
      responseJson = returnResponse(response);
    } on SocketException {
      log(' Put  Exception');
      throw FetchDataException('No Internet Connection');
    }
    return responseJson;
  }

  ///  PUT
  static Future<dynamic> putPost(String url,
      {Map<String, String>? params, Map<String, String>? headerMap}) async {
    dynamic responseJson;
    String jsonToBeSent = json.encode(params);
    print(_getUrl(url));
    try {
      var response;
      if (params == null) {
        response = await http.put(_getUrl(url), headers: headerMap);
      } else {
        response = await http.put(_getUrl(url),
            body: jsonToBeSent, headers: headerMap);
      }

      responseJson = returnResponse(response);
    } on SocketException {
      throw FetchDataException('No Internet Connection');
    }
    return responseJson;
  }

  ///  PUT
  static Future<dynamic> putPostNew(String url,
      {Map<String, dynamic>? params, Map<String, String>? headerMap}) async {
    dynamic responseJson;
    String jsonToBeSent = json.encode(params);
    print(_getUrl(url));
    try {
      var response;
      if (params == null) {
        response = await http.put(_getUrl(url), headers: headerMap);
      } else {
        response = await http.put(_getUrl(url),
            body: jsonToBeSent, headers: headerMap);
      }

      responseJson = returnResponse(response);
    } on SocketException {
      throw FetchDataException('No Internet Connection');
    }
    return responseJson;
  }

  ///DELETE

  static Future<dynamic> delete(String url,
      {Map<String, String>? headerMap, Map<String, dynamic>? params}) async {
    dynamic responseJson;
    print(_getUrl(url));
    try {
      var response;
      if (headerMap == null) {
        response = await http.delete(_getUrl(url));
      } else {
        response = await http.delete(_getUrl(url),
            headers: headerMap, body: json.encode(params));
      }
      log('$response');
      responseJson = returnResponse(response);
    } on SocketException {
      throw FetchDataException('No Internet Connection');
    }
    return responseJson;
  }

  ///DELETE

  static Future<dynamic> deleteJson(String url,
      {Map<String, String>? headerMap, Map<String, dynamic>? params}) async {
    dynamic responseJson;
    String jsonToBeSent = json.encode(params);
    print(_getUrl(url));
    try {
      var response;
      if (headerMap == null) {
        response = await http.delete(_getUrl(url));
      } else {
        response = await http.delete(_getUrl(url),
            headers: headerMap, body: jsonToBeSent);
      }
      responseJson = returnResponse(response);
    } on SocketException {
      throw FetchDataException('No Internet Connection');
    }
    return responseJson;
  }

  @visibleForTesting
  static dynamic returnResponse(http.Response response) {
    // print(response.statusCode);
    // print(response.body);
    dynamic responseJson = jsonDecode(response.body);
    print("===========================");
    print(responseJson);
    int statusCode = response.statusCode;
    log('$statusCode');
    switch (/*response.statusCode*/ statusCode) {
      case 200:

        /*dynamic responseJson = jsonDecode(response.body);*/
        return responseJson;
      case 400:
        return responseJson;
      // throw BadRequestException(/*response.body.toString()*/
      //     responseJson['message']);
      case 401:
        return Get.offAll(() => RegisterPhoneNumberPage());
      // throw BadRequestException(/*response.body.toString()*/
      //     responseJson['message']);
      case 403:
        return responseJson;

      case 500:
        throw UnauthorisedException(/*response.body.toString()*/
            responseJson['message']);
      case 404:
        throw BadRequestException(/*response.body.toString()*/
            responseJson['message']);

      default:
        throw FetchDataException(
            'Error occured while communication with server' +
                ' with status code : ${response.statusCode}');
    }
  }
}
