import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:lottie/lottie.dart';

import '../Service/ApiFunctions/current_version_service.dart';
import '../Service/ApiModels/CurrentVersionIdeaModel.dart';

class CurrentVersion extends StatefulWidget {
  const CurrentVersion({Key? key}) : super(key: key);

  @override
  State<CurrentVersion> createState() => _CurrentVersionState();
}

class _CurrentVersionState extends State<CurrentVersion> {
  Future<CurrentVersionIdeaModel?>? _future;

  CurrentVersionIdeaModel? _currentVersionList;

  _getData() {
    _future = CurrentVersionService().getIdeas();
    _future!.then((value) => _currentVersionList = value);
  }

  @override
  void initState() {
    _getData();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    var size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        leading: InkWell(
          onTap: () {
            //Get.back();
            Navigator.pop(context);
          },
          child: Icon(
            Icons.arrow_back_ios,
            color: Colors.black,
          ),
        ),
        title: Text(
          'Current Version',
          style: TextStyle(
              color: Colors.black,
              fontSize: size.height * 0.023,
              fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: FutureBuilder(
        future: _future,
        builder: (BuildContext context, AsyncSnapshot<dynamic> snapshot) =>
            snapshot.hasData
                ? Container(
                    // height: size.height,
                    // width: size.width,
                    padding: EdgeInsets.all(size.width * 0.05),
                    child: ListView.builder(
                      shrinkWrap: true,
                      itemCount: _currentVersionList!.items!.length,
                      itemBuilder: (BuildContext context, int index) {
                        return _currentVersionCard(size,
                            logo: _currentVersionList!
                                        .items![index].baseUserView !=
                                    null
                                ? _currentVersionList!
                                    .items![index].baseUserView!.logo
                                : 'https://w0.peakpx.com/wallpaper/673/485/HD-wallpaper-raven-crow-crow-dark-for-phone-glow-glowing-hasaka-iphone-xr-itachi-mangekyou-neon-neon-phone-phone-x-portrait-raven-red-red-glow-rock-sharingan-sky-triangle-neon.jpg',
                            title: _currentVersionList!
                                .items![index].userIdeaView!.title,
                            like: _currentVersionList!.items![index].likeCount,
                            gold: _currentVersionList!
                                .items![index].userIdeaView!.gold);
                      },
                    ),
                  )
                : Center(
                    child: Lottie.asset(
                      'assets/animations/loading.json',
                    ),
                  ),
      ),
    );
  }

  Widget _currentVersionCard(Size size,
          {String? title, String? logo, int? like, int? gold}) =>
      Container(
        padding:
            EdgeInsets.only(left: size.width * 0.03, right: size.width * 0.03),
        margin: EdgeInsets.only(bottom: size.height * 0.01),
        alignment: Alignment.center,
        height: size.height * 0.11,
        width: size.width,
        decoration: BoxDecoration(
            color: Color(0xff1ED400).withOpacity(0.1),
            borderRadius: BorderRadius.circular(size.height * 0.02)),
        child: Row(
          children: [
            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircleAvatar(
                  // height: size.height * 0.04,
                  radius: 20,
                  backgroundColor: Colors.white,
                  backgroundImage: AssetImage('assets/images/adevar_logo.png'),
                  foregroundImage: NetworkImage(
                    logo ??
                        'https://w0.peakpx.com/wallpaper/673/485/HD-wallpaper-raven-crow-crow-dark-for-phone-glow-glowing-hasaka-iphone-xr-itachi-mangekyou-neon-neon-phone-phone-x-portrait-raven-red-red-glow-rock-sharingan-sky-triangle-neon.jpg',
                  ),
                ),
                Row(
                  children: [
                    SvgPicture.asset(
                      'assets/images/star_svg.svg',
                      height: size.height * 0.018,
                    ),
                    Text(
                      '${gold ?? 700}',
                      style: TextStyle(
                          color: Color(0xffD7AD05),
                          fontSize: size.height * 0.017,
                          fontWeight: FontWeight.w600),
                    )
                  ],
                )
              ],
            ),
            SizedBox(
              width: size.width * 0.03,
            ),
            Container(
                alignment: Alignment.centerLeft,
                height: size.height * 0.05,
                width: size.width * 0.55,
                child: Text(
                  '1: ${title ?? "Calendar Planning Function"}',
                  style: TextStyle(
                      fontSize: size.height * 0.017,
                      fontWeight: FontWeight.w600),
                )),
            Spacer(),
            SvgPicture.asset(
              'assets/images/like_svg.svg',
              height: size.height * 0.018,
            ),
            SizedBox(
              width: size.width * 0.03,
            ),
            Text(
              '${like ?? 7}',
              style: TextStyle(
                  color: Color(0xff8E8E93), fontSize: size.height * 0.017),
            ),
            SizedBox(
              width: size.width * 0.03,
            ),
          ],
        ),
      );
}
