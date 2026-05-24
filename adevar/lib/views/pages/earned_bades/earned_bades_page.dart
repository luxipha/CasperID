import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:highfedilityadevar/consts/app_images.dart';
import 'package:highfedilityadevar/controllers/badges_controller/BadgesController.dart';
import 'package:highfedilityadevar/models/badgesModel/GetBadgesModel.dart';
import 'package:highfedilityadevar/utils/baseClass.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../controllers/user_data/get_shared_pref.dart';
import '../../../utils/AppDataNotifiier.dart';
import '../../../utils/SessionManager.dart';

class EarnedBadgesPage extends StatefulWidget {
  final List<BadgesData> badgeData;

  const EarnedBadgesPage({Key? key, required this.badgeData}) : super(key: key);

  @override
  _EarnedBadgesPage createState() => _EarnedBadgesPage();
}

class _EarnedBadgesPage extends State<EarnedBadgesPage> with BaseClass {
  List<BadgesData>? badgeData;

  final GetSharedPref _getSharedPref = Get.isRegistered<GetSharedPref>()
      ? Get.find<GetSharedPref>()
      : Get.put(GetSharedPref());

  final BadgesController _badgesController =
      Get.isRegistered<BadgesController>()
          ? Get.find<BadgesController>()
          : Get.put(BadgesController());

  @override
  void initState() {
    super.initState();
    badgeData = widget.badgeData;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Padding(
        padding: EdgeInsets.only(bottom: 15.0),
        child: GridView.builder(
            physics: NeverScrollableScrollPhysics(),
            itemCount: badgeData?.length,
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 14,
                childAspectRatio: 1.0,
                mainAxisSpacing: 18),
            shrinkWrap: true,
            scrollDirection: Axis.vertical,
            itemBuilder: (BuildContext context, int index) {
              return Column(
                children: [
                  InkWell(
                    onTap: () {
                      setBadge(context, badgeData?[index].id,
                          badgeData?[index].imgUrl);
                    },
                    child: Container(
                      height: 95,
                      width: 95,
                      child: Image.network(
                        badgeData?[index].imgUrl,
                        height: 95,
                        width: 95,
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  Text(
                    badgeData?[index].name,
                    style: GoogleFonts.roboto(
                        color: Colors.black,
                        fontWeight: FontWeight.w400,
                        fontSize: 12),
                  )
                ],
              );
            }),
      ),
    );
  }

  void setBadge(BuildContext context, id, imgUrl) async {
    showCircularDialog(context);
    UserPref.userPref = await SharedPreferences.getInstance();
    var userDataModel = await _getSharedPref.getUserData();
    try {
      Map<String, String> params = {"badgeId": id.toString()};
      var model = await _badgesController.setEarnedBadge(
          userDataModel.authToken.toString(), params);
      Navigator.of(context).pop();

      if (model.flag!) {
        showSuccess(title: "Success", message: model.message!);
        UserPref.setBadgeUrl(imgUrl);
        Provider.of<AppDataNotifier>(context, listen: false).updateBadgeUrl(1);
      } else {
        throw model.message!;
      }
    } catch (error) {
      // showError(title: "Error", message: error.toString());
    }
    setState(() {});
  }
}
