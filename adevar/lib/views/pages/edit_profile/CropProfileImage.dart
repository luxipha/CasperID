import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/cupertino.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/models/me_user_model/UpdateUserProfileModel.dart';
import 'package:highfedilityadevar/utils/AppDataNotifiier.dart';
import 'package:highfedilityadevar/utils/common_widgets.dart';
import 'package:path/path.dart';
import 'package:http_parser/http_parser.dart';
import 'package:crop_your_image/crop_your_image.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:highfedilityadevar/controllers/user_data/get_shared_pref.dart';
import 'package:highfedilityadevar/micheal_code/Service/Urls.dart';
import 'package:highfedilityadevar/models/me_user_model/UploadUserProfileModel.dart';
import 'package:highfedilityadevar/models/user_data/user_model.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/views/pages/edit_profile/edit_profile_page.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../controllers/me_user_profile_controller/UpdateUserProfileController.dart';
import '../../../utils/SessionManager.dart';
import 'package:image_gallery_saver/image_gallery_saver.dart';

class CropProfileImage extends StatefulWidget {
  final File? profileImage;
  final String? logoUrl;
  final String? logoId;

  const CropProfileImage(
      {Key? key, this.profileImage, this.logoUrl, this.logoId})
      : super(key: key);

  @override
  _CropProfileImage createState() => _CropProfileImage();
}

class _CropProfileImage extends State<CropProfileImage> with BaseClass {
  bool mainImageCropped = false;
  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());

  final UpdateUserProfileController _updateUserProfileController =
      Get.isRegistered<UpdateUserProfileController>()
          ? Get.find<UpdateUserProfileController>()
          : Get.put(UpdateUserProfileController());

  final _controller = CropController();
  Uint8List? imageInUnit8List;
  Uint8List? _croppedData;

  var _isProcessing = false;

  set isProcessing(bool value) {
    setState(() {
      _isProcessing = value;
    });
  }

  set croppedData(Uint8List? value) {
    setState(() {
      _croppedData = value;
    });
  }

  @override
  void initState() {
    super.initState();
    convertImage();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(''),
      ),
      body: imageInUnit8List != null && !_isProcessing
          ? Column(
              children: [
                SizedBox(
                  height: 40,
                ),
                Container(
                  height: MediaQuery.of(context).size.height * 0.55,
                  child: Crop(
                    controller: _controller,
                    image: imageInUnit8List!,
                    onCropped: (cropped) {
                      croppedData = cropped;
                      isProcessing = false;
                    },
                    initialSize: 0.8,
                    cornerDotBuilder: (size, edgeAlignment) =>
                        const SizedBox.shrink(),
                    maskColor: Colors.grey.withAlpha(140),
                    baseColor: Colors.black26,
                    withCircleUi: true,
                  ),
                ),
                SizedBox(
                  height: 90,
                ),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    InkWell(
                      onTap: () {
                        Navigator.of(context).pop();
                      },
                      child: Container(
                        width: 80,
                        height: 80,
                        child: Icon(
                          Icons.close,
                          size: 35,
                          color: Colors.red,
                        ),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.red.withAlpha(20),
                        ),
                      ),
                    ),
                    SizedBox(
                      width: 90,
                    ),
                    InkWell(
                      onTap: () {
                        _controller.cropCircle();
                        showCircularDialog(context);
                        Future.delayed(const Duration(milliseconds: 1800), () {
                          if (_croppedData != null) {
                            if (widget.logoUrl != null) {
                              print("asdasdasdasd");
                              changeUserProfile(widget.logoId, context);
                            } else if (widget.profileImage != null) {
                              setUserProfile(context);
                            }
                          } else {
                            Navigator.of(context).pop();
                          }
                        });
                      },
                      child: Container(
                        width: 80,
                        height: 80,
                        child: Icon(
                          Icons.check,
                          size: 35,
                          color: AppColors.BUTTON_COLOR,
                        ),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.blue.withAlpha(20),
                        ),
                      ),
                    ),
                  ],
                )
              ],
            )
          : circularProgressView(),
    );
  }

  void changeUserProfile(logoId, BuildContext context) async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    try {
      var model = await _updateUserProfileController.changeProfileImage(
          userDataModel.authToken!, logoId.toString());
      if (model.flag) {
        // showSuccess(title: "Success", message: model.message);
        updateMainProfileImage(logoId, context);
      } else {
        throw model.message;
      }
    } catch (error) {
      print(error);
      // showError(title: "Error ", message: error.toString());
    }
  }

  void setUserProfile(BuildContext context) async {
    UserDataModel userDataModel = await _getSharedPref.getUserData();
    try {
      var uri = Uri.parse('${Urls.baseUrl}/user/addHeader?lang=en_US');
      var request = new http.MultipartRequest("POST", uri);
      var stream = new http.ByteStream(widget.profileImage!.openRead());
      stream.cast();
      var length = await widget.profileImage!.length();
      request.files.add(http.MultipartFile(
        'file',
        stream,
        length,
        filename: basename(widget.profileImage!.path),
        contentType: MediaType('image', 'jpeg'),
      ));

      Map<String, String> headers = {
        "Content-Type": "multipart/form-data",
        "Authorization": userDataModel.authToken!
      }; // ignore this headers if there is no authentication

      //add headers
      request.headers.addAll(headers);

      // send
      var response = await request.send();

      // listen for response
      response.stream.transform(utf8.decoder).listen((value) {
        UploadUserProfileModel uploadUserProfileModel =
            UploadUserProfileModel.fromJson(jsonDecode(value));
        if (uploadUserProfileModel.flag) {
          updateMainProfileImage(uploadUserProfileModel.id, context);
        } else {
          throw uploadUserProfileModel.message.toString();
        }
      });
    } catch (onError) {
      // showError(title: "Error", message: onError.toString());
    }
  }

  void convertImage() async {
    UserPref.userPref = await SharedPreferences.getInstance();
    if (widget.logoUrl != null) {
      final response = await http.get(Uri.parse(widget.logoUrl!));
      imageInUnit8List = response.bodyBytes;
    } else if (widget.profileImage != null) {
      imageInUnit8List = widget.profileImage!.readAsBytesSync();
    }
    setState(() {});
  }

  void updateMainProfileImage(id, BuildContext context) async {
    String dir = (await getApplicationDocumentsDirectory()).path;
    String fullPath = '$dir/temp.png';
    File file = File(fullPath);
    await file.writeAsBytes(_croppedData!);
    var userDataModel = await _getSharedPref.getUserData();
    try {
      var uri = Uri.parse('${Urls.baseUrl}/user/justUpdateAvatar?lang=en_US');
      var request = new http.MultipartRequest("PUT", uri);
      var stream = new http.ByteStream(file.openRead());
      stream.cast();
      var length = await file.length();

      request.files.add(http.MultipartFile(
        'file',
        stream,
        length,
        filename: basename(file.path),
        contentType: MediaType('image', 'jpeg'),
      ));

      Map<String, String> headers = {
        "Content-Type": "multipart/form-data",
        "Authorization": userDataModel.authToken!
      };

      Map<String, String> params = {
        "logoId": id.toString(),
      };

      //add headers
      request.headers.addAll(headers);
      request.fields.addAll(params);

      // send
      var response = await request.send();

      // listen for response
      response.stream.transform(utf8.decoder).listen((value) {
        print(value);

        var responseJson = jsonDecode(value);
        Navigator.pop(context);
        if (responseJson['flag']) {
          file.delete();
          // showSuccess(title: "Success", message: responseJson['message']);
          Navigator.of(context).pop();
          Navigator.of(context).pushReplacement(
              new MaterialPageRoute(builder: (context) => EditProfilePage()));
        } else {
          throw responseJson['message'];
        }
      });
    } catch (onError) {
      // showError(title: "Error", message: onError.toString());
    }
  }
}
