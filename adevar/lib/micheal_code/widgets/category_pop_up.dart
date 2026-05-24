import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:provider/provider.dart';

import '../core/provider/app_provider.dart';
import '../core/provider/category_provider.dart';
import '../core/provider/idea_providers/app_questions_provider.dart';
import '../core/provider/idea_providers/colours_provider.dart';
import '../core/provider/idea_providers/idea_list_provider.dart';
import '../core/provider/idea_providers/portfolio_provider.dart';
import '../core/provider/idea_providers/settings_provider.dart';
import '../core/provider/idea_providers/share_ideas_provider.dart';
import 'colors..dart';

class CategoryPopUp extends StatefulWidget {
  @override
  State<CategoryPopUp> createState() => _CategoryPopUpState();
}

class _CategoryPopUpState extends State<CategoryPopUp> {
  void refreshCategory(int currentIndex, String latest) {
    switch (currentIndex) {
      case 0:
        Provider.of<ShareIdeasProvider>(context, listen: false).getIdealList(
          queryType: latest,
        );
        break;
      case 1:
        Provider.of<AppQuestionsProvider>(context, listen: false).getIdealList(
          queryType: latest,
        );
        break;
      case 2:
        Provider.of<IdeaListProvider>(context, listen: false).getIdealList(
          queryType: latest,
        );
        break;
      case 3:
        Provider.of<PortfolioProvider>(context, listen: false).getIdealList(
          queryType: latest,
        );
        break;
      case 4:
        Provider.of<ColoursProvider>(context, listen: false).getIdealList(
          queryType: latest,
        );
        break;
      case 4:
        Provider.of<ColoursProvider>(context, listen: false).getIdealList(
          queryType: latest,
        );
        break;
      case 5:
        Provider.of<SettingsProvider>(context, listen: false).getIdealList(
          queryType: latest,
        );
        break;
      default:
        print('====> No Tab to refresh');
    }
  }

  @override
  Widget build(BuildContext context) {
    final Size size = MediaQuery.of(context).size;

    return Consumer2<CategoryProvider, AppProvider>(
      builder:
          (context, CategoryProvider categoryProvider, AppProvider appPro, _) {
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
                        refreshCategory(
                            selectedTab,
                            categoryProvider.latest == 'Popular'
                                ? 'like'
                                : categoryProvider.latest);
                        setState(() {});
                        // Provider.of<IdeaListProvider>(context, listen: false)
                        //     .getIdealList(
                        //   queryType: categoryProvider.latest,
                        // );
                        // print(
                        //     "===QR List===> ${_idealList!.items}");
                        // Navigator.of(context).push(
                        //   new MaterialPageRoute(
                        //     builder: (context) =>
                        //         AdevarForum(),
                        //   ),
                        // );

                        // _idealList!.items.sort((a, b) => );
                        // });
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
