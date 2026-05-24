import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:provider/provider.dart';


import '../../core/provider/app_provider.dart';
import '../../core/provider/idea_providers/share_ideas_provider.dart';
import '../colors..dart';

class ShareIdeaPopUp extends StatefulWidget {
  @override
  State<ShareIdeaPopUp> createState() => _ShareIdeaPopUpState();
}

class _ShareIdeaPopUpState extends State<ShareIdeaPopUp> {
  @override
  Widget build(BuildContext context) {
    final Size size = MediaQuery.of(context).size;

    return Consumer2<ShareIdeasProvider, AppProvider>(
      builder: (context, ShareIdeasProvider categoryProvider,
          AppProvider appPro, _) {
        var selectedTab = Provider.of<AppProvider>(context, listen: false)
            .ideasTabController!
            .index;

        return Container(
          padding: EdgeInsets.only(
              left: size.width * 0.06, right: size.width * 0.06),
          width: size.width * .35,
          height: categoryProvider.showPopUp == false
              ? size.height * .05
              : size.height * .11,
          decoration: BoxDecoration(
              color: const Color(0xffF2F8FD),
              borderRadius: BorderRadius.circular(20)),
          child: InkWell(
            onTap: () {
              categoryProvider.changeShowPopUp();
            },
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  height: size.height * 0.015,
                ),
                Row(
                  // mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    Text(
                      categoryProvider.latest,
                      style: TextStyle(
                          fontSize: size.height * 0.018,
                          fontWeight: FontWeight.w500,
                          color: blueColor),
                    ),
                    const Spacer(),
                    categoryProvider.showPopUp == false
                        ? SvgPicture.asset(
                            'assets/images/arrow_down_svg.svg',
                            height: size.height * 0.009,
                          )
                        : SvgPicture.asset('assets/images/arrow_up_svg.svg',
                            height: size.height * 0.009),
                  ],
                ),
                Visibility(
                  visible: categoryProvider.showPopUp,
                  child: Padding(
                    padding: EdgeInsets.only(top: size.height * 0.015),
                    child: InkWell(
                      onTap: () {
                        print('------> ${categoryProvider.temp}');
                        // setState(() {
                        categoryProvider.changeShowPopUp();
                        categoryProvider.temp = categoryProvider.latest;
                        categoryProvider.latest = categoryProvider.popular;
                        categoryProvider.popular = categoryProvider.temp;
                        categoryProvider.changeNotifiers();
                        print(categoryProvider.latest);
                        categoryProvider.refreshIdea();
                        setState(() {});
                      },
                      child: Container(
                        height: size.height * 0.05,
                        // color: Colors.red,
                        child: Row(
                          children: [
                            Text(
                              categoryProvider.popular,
                              style: TextStyle(
                                  fontSize: size.height * 0.018,
                                  fontWeight: FontWeight.w500,
                                  color: const Color(0xffAEAEB2)),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                )
              ],
            ),
          ),
        );
      },
    );
  }
}
