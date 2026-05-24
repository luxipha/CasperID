import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/views/dialogs/delete_login_device_dialog.dart';
import 'package:highfedilityadevar/views/widgets/login_devices_widget.dart';
import 'package:intl/intl.dart';

import '../../../controllers/get_all_logged_in_devices/get_all_logged_in_devices_controller.dart';

class DeleteLoginDevices extends StatelessWidget with BaseClass{
  final GetLoggedInDeviceController _getLoggedInDeviceController =
      Get.isRegistered<GetLoggedInDeviceController>()
          ? Get.find<GetLoggedInDeviceController>()
          : Get.put(GetLoggedInDeviceController());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Login device',
          style: GoogleFonts.roboto(
              fontWeight: FontWeight.w700, fontSize: 18, color: Colors.black),
        ),
        centerTitle: true,
      ),
      body: GetBuilder<GetLoggedInDeviceController>(
          init: _getLoggedInDeviceController,
          builder: (value) {
            return value.loggedInDevicesModel == null
                ? Center(
                    child: CircularProgressIndicator(
                    valueColor: new AlwaysStoppedAnimation<Color>(
                      AppColors.red,
                    ),
                  ))
                : value.loggedInDevicesModel!.items!.length == 0
                    ? Center(
                        child: Text(
                          "No Logged In Devices Found",
                          style: GoogleFonts.montserrat(
                              color: Colors.black,
                              fontSize: 18,
                              fontWeight: FontWeight.w500),
                        ),
                      )
                    : Container(
                        alignment: Alignment.topLeft,
                        padding:
                            EdgeInsets.symmetric(horizontal: 30, vertical: 30),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.start,
                          children: [
                            Text(
                              'Recently logged in device:',
                              textAlign: TextAlign.start,
                              style: GoogleFonts.roboto(
                                  color: Colors.black,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 18),
                            ),
                            SizedBox(
                              height: 30,
                            ),
                            Text(
                              'you can delete the device in the list. After deletion,\nyou need to authenticate when logging in to the\ndevice',
                              style: GoogleFonts.roboto(
                                  color: Colors.grey,
                                  fontWeight: FontWeight.w400,
                                  fontSize: 12),
                            ),
                            SizedBox(
                              height: 30,
                            ),
                            Expanded(
                              child: ListView.builder(
                                  shrinkWrap: true,
                                  itemCount:
                                      value.loggedInDevicesModel!.items!.length,
                                  itemBuilder:
                                      (BuildContext context, int index) {
                                    return Column(
                                      children: [
                                        LoginDevicesWidget(
                                            title: value
                                                .loggedInDevicesModel!.items!
                                                .elementAt(index)!
                                                .osType
                                                .toString(),
                                            subTitle: DateFormat(
                                                    'yyyy-MM-dd hh:mm:ss')
                                                .format(DateTime.parse(value
                                                    .loggedInDevicesModel!
                                                    .items!
                                                    .elementAt(index)!
                                                    .updated!)),
                                            trailingWidget: GestureDetector(
                                              onTap: () {
                                                DeleteLoginDeviceDialog
                                                    .loginDeviceDialog(context,
                                                        deviceName: value
                                                            .loggedInDevicesModel!
                                                            .items!
                                                            .elementAt(index)!
                                                            .osType
                                                            .toString(),
                                                        onCancel: () {
                                                          Get.back();
                                                        },
                                                        onDelete: () {
                                                      Get.back();
                                                      showSuccess(title: "Success", message: "Delete");
                                                        });
                                              },
                                              child: Image(
                                                image: AssetImage(
                                                    AppImages.DELETE),
                                                height: 25,
                                                width: 25,
                                              ),
                                            ),
                                            leadingImage:
                                                AppImages.PHONE_DEVICE,
                                            onTileTap: () {}),
                                        Divider(
                                          thickness: 1,
                                        ),
                                      ],
                                    );
                                  }),
                            ),
                          ],
                        ),
                      );
          }),
    );
  }
}
