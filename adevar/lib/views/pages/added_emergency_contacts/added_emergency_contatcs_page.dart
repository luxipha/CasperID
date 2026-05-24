import 'package:flutter/material.dart';
import 'package:flutter_slidable/flutter_slidable.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/controllers/account_security_emergency_contact/account_security_emergency_contact_controller.dart';
import 'package:highfedilityadevar/models/account_security/emergency_contact/get_emergency_contact_model.dart';
import 'package:highfedilityadevar/models/account_security/emergency_contact/get_emergency_contact_model.dart'
    as getContact;
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:highfedilityadevar/views/pages/emergency_contact/emergency_contact_page.dart';

import '../../../models/account_security/emergency_contact/invite_emergency_contact_model.dart';

class AddedEmergencyContactsPage extends StatefulWidget {
  @override
  State<AddedEmergencyContactsPage> createState() =>
      _AddedEmergencyContactsPageState();
}

class _AddedEmergencyContactsPageState extends State<AddedEmergencyContactsPage>
    with BaseClass {
  TextEditingController textEditingController = TextEditingController();
  AccountSecurityEmergencyContactController controller =
      AccountSecurityEmergencyContactController();
  List<getContact.Data> getContactList = <getContact.Data>[];
  final SlidableController slidableController = SlidableController();

  @override
  void initState() {
    getAllContact();

    super.initState();
  }

  getAllContact() async {
    try {
      Future.delayed(Duration(microseconds: 50), () {
        showCircularDialog(context);
      });

      GetEmergencyContactModel model = await controller.getEmergencyContact();
      Get.back();
      if (model.flag!) {
        getContactList.clear();
        if (model.data != null) {
          getContactList.addAll(model.data!);
        }

        setState(() {});
      } else {
        showError(title: 'Error', message: model.message!);
      }
    } on Exception catch (e) {
      // showError(title: 'Error', message: e.toString());
    }
  }

  removeContact(mobile, index) async {
    try {
      showCircularDialog(context);
      IniviteEmergencyContactModel model =
          await controller.deleteEmergencyContact(mobile);
      Get.back();
      if (model.flag!) {
        showSuccess(title: 'Success', message: model.message!);
        getContactList.removeAt(index);
        setState(() {});
      } else {
        Get.back();
        showError(title: 'Error', message: model.message!);
      }
    } catch (e) {
      // showError(title: 'Error', message: e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: getContactList.length != 5
          ? GestureDetector(
              onTap: () {
                Get.to(EmergencyContactPage())!
                    .then((value) => getAllContact());
              },
              child: Image(
                image: AssetImage(
                  AppImages.ADD_EMERGENCY_CONTACT,
                ),
                height: 70,
                width: 70,
              ),
            )
          : Offstage(),
      appBar: AppBar(
        title: Text(
          'Emergency Contact',
          style: GoogleFonts.roboto(
              fontWeight: FontWeight.w700, fontSize: 18, color: Colors.black),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              SizedBox(
                height: 40,
              ),
              Image(
                image: AssetImage(
                  AppImages.EMERGENCY_CONTACT_PICK,
                ),
                height: 100,
                width: 100,
              ),
              SizedBox(
                height: 12,
              ),
              Text(
                'Emergency Contact',
                style: GoogleFonts.roboto(
                    color: Colors.black,
                    fontWeight: FontWeight.w400,
                    fontSize: 18),
              ),
              SizedBox(
                height: 12,
              ),
              Text(
                'You can add upto 5 emergency contact',
                style: GoogleFonts.roboto(
                    color: Colors.blue,
                    fontWeight: FontWeight.w400,
                    fontSize: 14),
              ),
              SizedBox(
                height: 15,
              ),
              ListView.builder(
                itemCount: getContactList.length,
                shrinkWrap: true,
                physics: NeverScrollableScrollPhysics(),
                itemBuilder: (context, int index) {
                  return userInfoWidget(getContactList, index);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget userInfoWidget(List<getContact.Data> dataList, int index) {
    return Slidable(
      key: Key(index.toString()),
      controller: slidableController,
      actionPane: SlidableDrawerActionPane(),
      closeOnScroll: true,
      secondaryActions: [
        InkWell(
          onTap: () {
            removeContact(dataList[index].mobile, index);

            slidableController.activeState!.close();
          },
          child: Container(
            margin: EdgeInsets.symmetric(horizontal: 0, vertical: 5),
            padding: EdgeInsets.zero,
            decoration: BoxDecoration(
              color: Colors.red,
              borderRadius: BorderRadius.only(
                topRight: Radius.circular(15),
                bottomRight: Radius.circular(15),
              ),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.close,
                  color: Colors.white,
                  size: 40,
                ),
                Text(
                  'Remove',
                  style: GoogleFonts.roboto(color: Colors.white, fontSize: 14),
                ),
              ],
            ),
          ),
        ),
        // Container(
        //   child: Column(
        //     children: [Image(image: AssetImage(AppImages.SLIDE_CLOSE))],
        //   ),
        // )
      ],
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 15, horizontal: 20),
        margin: EdgeInsets.symmetric(horizontal: 0, vertical: 5),
        // width: Get.width / 2,
        decoration: BoxDecoration(
          color: AppColors.BUTTON_COLOR.withOpacity(0.1),
          borderRadius: BorderRadius.circular(15),
        ),
        child: Row(
          children: [
            dataList[index].logo != ''
                ? Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(40),
                      child: Image(
                        image: NetworkImage(dataList[index].logo.toString()),
                        height: 70,
                        width: 70,
                        fit: BoxFit.cover,
                      ),
                    ),
                  )
                : dataList[index].logo == '' && dataList[index].isActivate == 0
                    ? Container(
                        height: 70,
                        width: 70,
                        decoration: BoxDecoration(
                          color: Colors.black,
                          shape: BoxShape.circle,
                        ),
                      )
                    : Image(
                        image: AssetImage(AppImages.face_confirm),
                        height: 70,
                        width: 70,
                      ),
            SizedBox(
              width: 15,
            ),
            if (dataList[index].isActivate != 0)
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Expanded(
                          child: Text(
                            '${dataList[index].firstName} ${dataList[index].lastName}',
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.roboto(
                                fontWeight: FontWeight.w400,
                                fontSize: 20,
                                color: Colors.black),
                          ),
                        ),
                        SizedBox(
                          width: 10,
                        ),
                        if (dataList[index].gender.toString() == 'Male')
                          Image(
                            image: AssetImage(AppImages.male),
                            width: 11,
                            height: 15,
                          ),
                        if (dataList[index].gender.toString() == 'Female')
                          Image(
                            image: AssetImage(AppImages.female),
                            width: 11,
                            height: 15,
                          ),
                      ],
                    ),
                    Text(
                      '${dataList[index].position}',
                      // 'Xiamen · UX designer',
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.roboto(
                          fontWeight: FontWeight.w400,
                          fontSize: 12,
                          color: AppColors.DARK_GREY),
                    ),
                    SizedBox(
                      height: 21,
                    ),
                    Text(
                      dataList[index].company.toString() != ""
                          ? '${dataList[index].company.toString()} Technologies co.Ltd'
                          : "",
                      // ' Sabedoria Technologies co.Ltd ',
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.roboto(
                          fontWeight: FontWeight.w400,
                          fontSize: 12,
                          color: AppColors.DARK_GREY),
                    ),
                  ],
                ),
              ),
            if (dataList[index].isActivate == 0)
              Expanded(
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        dataList[index].mobile!,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.roboto(
                            fontWeight: FontWeight.w400,
                            fontSize: 20,
                            color: Colors.black),
                      ),
                    ),
                    SizedBox(
                      width: 5,
                    ),
                    Expanded(
                      child: Container(
                        padding: EdgeInsets.all(5),
                        decoration: BoxDecoration(
                            border: Border.all(
                              color: Color(0xffCCCCCC),
                            ),
                            borderRadius: BorderRadius.circular(10)),
                        child: Text(
                          'Unverified',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.roboto(
                            fontWeight: FontWeight.w400,
                            fontSize: 16,
                            color: Color(0xffCCCCCC),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
