import 'dart:io';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/views/pages/edit_profile/CropProfileImage.dart';
import 'package:image_picker/image_picker.dart';

class ChooseProfileImageBottomSheet {
  final picker = ImagePicker();
  File? _image;

  void showUploadImageActionSheet(BuildContext context, {bool isVideo = false,}) {
    showCupertinoModalPopup(
      context: context,
      builder: (BuildContext context) =>
          CupertinoActionSheet(
            title: Text('Choose Options',
                style: TextStyle(
                    fontSize: 18.0,
                    fontWeight: FontWeight.w500,
                    color: AppColors.BLACK)),
            message: Text('Your options are'),
            actions: <Widget>[
              CupertinoActionSheetAction(
                child: Text('Camera'),
                onPressed: () async {
                  Get.back();
                  try {

                    _image = await getImage(true,isVideo);

                    if(_image!=null){
                      Navigator.of(context,rootNavigator: true).push(new MaterialPageRoute(builder: (context)=>CropProfileImage(profileImage: _image!)));
                    }

                    // selectedImage("_image");
                  } catch (error) {
                    throw error;
                  }
                },
              ),
              CupertinoActionSheetAction(
                child: Text('Choose from Gallery'),
                onPressed: () async {
                  Get.back();
                  try {
                    _image = await getImage(false,isVideo);
                    if(_image!=null){
                      Navigator.of(context,rootNavigator: true).push(new MaterialPageRoute(builder: (context)=>CropProfileImage(profileImage: _image!)));
                    }
                    // selectedImage("_image");
                  } catch (error) {
                    throw error;
                  }
                },
              )
            ],
            cancelButton: CupertinoActionSheetAction(
              child: Text('Cancel'),
              isDefaultAction: true,
              onPressed: () {
                Navigator.pop(context, 'Cancel');
              },
            ),
          ),
    );
  }

  Future<File> getImage(bool isCamera,bool isVideo) async {
    try {
      if(isVideo){
        final pickedFile = await picker.pickVideo(
            source: isCamera ? ImageSource.camera : ImageSource.gallery);

        return File(pickedFile!.path);
      }
      else {
        final pickedFile = await picker.pickImage(
            source: isCamera ? ImageSource.camera : ImageSource.gallery);

        return File(pickedFile!.path);
      }
    } catch (error) {
      print('No Image Selected');
      throw error.toString();
    }
  }
}
