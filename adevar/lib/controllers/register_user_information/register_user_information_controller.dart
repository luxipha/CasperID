import 'dart:io';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:highfedilityadevar/services/api_service.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:http/http.dart' as http;
import 'package:flutter/cupertino.dart';
import 'dart:convert';
import 'package:path/path.dart';
import 'package:async/async.dart';
import 'package:http_parser/http_parser.dart';
import '../../models/registerInfo/register_info_model.dart';

class RegisterUserInformationController extends GetxController with BaseClass {
  Future<RegisterUserInforModel> sendUserInformationApi(
      Map<String, String> params, String authorizationToken) async {
    try {
      print(params);
      final response = await ApiService.post(
        "user/loginReginfo?lang=en_US",
        params: params,
        headerMap: {
          "Content-Type": "application/json",
          "Authorization": authorizationToken
        },
      );
      print(response);
      return RegisterUserInforModel.fromJson(response);
    } catch (error) {
      throw error.toString();
    }
  }

  Future<void> uploadUserImage(
      BuildContext context, String authorizationToken, File userImage) async {
    try {
      var uri = Uri.parse(
          'https://mobapis.adevar.app/user/loginReginfo/head?lang=en_US');
      print(uri.path);
// create multipart request
      var request = new http.MultipartRequest("POST", uri);

      String fileName = userImage.path.split("/").last;
      var stream =
          new http.ByteStream(DelegatingStream.typed(userImage.openRead()));
      // get file length
      var length = await userImage.length(); //imageFile is your image file
      // multipart that takes file
      /*var multipartFileSign =
         new http.MultipartFile('photos', File(_image1.path).readAsBytes().asStream(), File(_image1.path).lengthSync(), filename: _image1.path.split("/").last);*/
      request.files.add(
        http.MultipartFile(
          'file',
          stream,
          length,
          filename: basename(userImage.path),
          contentType: MediaType('image', 'jpeg'),
        ),
      );

      Map<String, String> headers = {
        "Content-Type": "multipart/form-data",
        "Authorization": authorizationToken
      }; // ignore this headers if there is no authentication

//add headers
      request.headers.addAll(headers);

// request.fields['firstName'] = 'abc';
// request.fields['lastName'] = 'efg';

// send
      var response = await request.send();

// listen for response
      response.stream.transform(utf8.decoder).listen((value) {
        //popToPreviousScreen(context: context);

        print('SUCEESSS');
        print(value);

        //   Navigator.of(context).pop(true);
      });
    } catch (onError) {
      //  popToPreviousScreen(context: context);
      print('FAILURE');
      print(onError);
      throw (onError);
    }
  }
}
