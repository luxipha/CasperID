import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_colors.dart';
import 'package:highfedilityadevar/consts/app_global_data.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/views/dialogs/delete_authorization_dialog.dart';

class DeleteAuthorizationSettingPage extends StatelessWidget {
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
              SizedBox(
                height: 30,
              ),
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
                                height: 40,
                                width: 40,
                                child: Image(
                                  image: AssetImage(
                                    AppData.authorizationSettingList
                                        .elementAt(index)['image'],
                                  ),
                                ),
                              ),
                              SizedBox(
                                width: 10,
                              ),
                              Expanded(
                                child: Text(
                                  AppData.authorizationSettingList
                                      .elementAt(index)['name'],
                                  style: GoogleFonts.roboto(
                                    fontWeight: FontWeight.w400,
                                    fontSize: 18,
                                    color: Colors.black,
                                  ),
                                ),
                              ),
                              GestureDetector(
                                onTap: () {
                                  DeleteAuthorizationDialog.authorizationDialog(context);
                                },
                                child: Image(
                                  image: AssetImage(AppImages.DELETE),
                                  height: 25,
                                  width: 25,
                                ),
                              ),
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
