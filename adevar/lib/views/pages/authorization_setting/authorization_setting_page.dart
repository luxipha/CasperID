import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_global_data.dart';
import 'package:highfedilityadevar/views/pages/delete_authorization_setting/delete_authorization_page.dart';

class AuthorizationSettingPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: Text(
            'Authorization',
            style: GoogleFonts.roboto(
              fontWeight: FontWeight.w700,
              fontSize: 18,
              color: Colors.black,
            ),
          ),
          centerTitle: true,
          actions: [
            TextButton(
                onPressed: () {
                  Get.to(()=>DeleteAuthorizationSettingPage());
                },
                child: Text(
                  'Edit',
                  style: GoogleFonts.roboto(
                      color: AppColors.BUTTON_COLOR,
                      fontWeight: FontWeight.w400),
                ))
          ],
        ),
        body: Container(
          margin: EdgeInsets.symmetric(horizontal: 33, vertical: 25),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Recent Authorization:',
                style: GoogleFonts.roboto(
                  fontWeight: FontWeight.w400,
                  fontSize: 18,
                  color: Colors.black,
                ),
              ),
              SizedBox(
                height: 25,
              ),
              Text(
                'you can delete the Authorization in the list. After deletion, you need to authenticate when logging in to the device',
                style: GoogleFonts.roboto(
                  fontWeight: FontWeight.w400,
                  fontSize: 12,
                  color: Colors.grey,
                ),
              ),
              SizedBox(height: 30,),
              Divider(),
              Expanded(
                child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: AppData.authorizationSettingList.length,
                    itemBuilder: (BuildContext context, int index) {
                      return Column(
                        children: [

                          Row(
                            children: [
                              Container(
                                height:40,
                                width:40,
                                child: Image(
                                  image: AssetImage(
                                    AppData.authorizationSettingList
                                        .elementAt(index)['image'],
                                  ),
                                ),
                              ),
                              SizedBox(width: 10,),
                              Expanded(
                                child: Text(
                                  AppData.authorizationSettingList.elementAt(index)['name'],
                                  style: GoogleFonts.roboto(
                                    fontWeight: FontWeight.w400,
                                    fontSize: 18,
                                    color: Colors.black,
                                  ),
                                ),
                              ),
                              Icon(Icons.arrow_forward_ios,color: AppColors.FORM_ICON,)
                            ],
                          ),
                          Divider(),
                        ],
                      );
                    }),
              )
            ],
          ),
        ));
  }
}
