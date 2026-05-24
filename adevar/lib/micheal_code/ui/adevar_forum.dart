import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get/get.dart';
import 'package:lottie/lottie.dart';
import 'package:provider/provider.dart';

import '../Service/ApiModels/DataStatisticsModel.dart';
import '../Service/ApiModels/FormIdeaListModel.dart';
import '../core/provider/app_provider.dart';
import '../core/provider/category_pop_up_provider.dart';
import '../core/provider/category_provider.dart';
import '../core/provider/idea_providers/app_questions_provider.dart';
import '../core/provider/idea_providers/colours_provider.dart';
import '../core/provider/idea_providers/idea_list_provider.dart';
import '../core/provider/idea_providers/portfolio_provider.dart';
import '../core/provider/idea_providers/settings_provider.dart';
import '../core/provider/idea_providers/share_ideas_provider.dart';
import '../core/provider/vote_provider.dart';
import '../widgets/category_pop_up.dart';
import '../widgets/category_tab_bar_view.dart';
import '../widgets/colors..dart';
import '../widgets/pop_up/app_questions_pop_up.dart';
import '../widgets/pop_up/colours_pop_up.dart';
import '../widgets/pop_up/portfolio_pop_up.dart';
import '../widgets/pop_up/qr_code_pop_up.dart';
import '../widgets/pop_up/settings_pop_up.dart';
import '../widgets/pop_up/share_idea_pop_up.dart';
import '../widgets/post_modal_sheet.dart';
import '../widgets/vote_box.dart';
import 'current_verison.dart';
import 'vote.dart';
import 'voted_feature.dart';

class AdevarForum extends StatefulWidget {
  const AdevarForum({Key? key}) : super(key: key);

  @override
  State<AdevarForum> createState() => _AdevarForumState();
}

class _AdevarForumState extends State<AdevarForum> with TickerProviderStateMixin
// ,AutomaticKeepAliveClientMixin<AdevarForum>
{
  // @override
  // bool get wantKeepAlive => true;

  bool buttonCheck = false;
  String selectValue = "Latest";
  bool check1 = false;
  String valueChoose = '';
  List listItem = ['item1', 'item2']; // ion 2
  var latest = 'Latest';
  var popular = 'Popular';
  var temp = 'latest';
  late IdeaListProvider ideaListProvider;
  late AppQuestionsProvider appQuestionsProvider;
  late PortfolioProvider portfolioProvider;
  late VoteProvider voteProvider;

  // Future<DataStatisticsModel?>? _future;
  // Future<FormIdeaListModel?>? _ideaListFuture;
  // FormIdeaListModel? _idealList;

  // var _selectedLocation;
  bool popup = false;
  // TabController? _tabController;

  // Future<void> fetchIdeaList() async {
  //   ideaListProvider.increaseCurrentPage();

  //   await Provider.of<IdeaListProvider>(context, listen: false)
  //       .getMoreIdealList(page: ideaListProvider.currentPage, queryType: temp);
  // }

  @override
  void initState() {
    super.initState();
    CategoryProvider categoryProvider =
        Provider.of<CategoryProvider>(context, listen: false);

    Provider.of<AppProvider>(context, listen: false).ideasTabController =
        TabController(initialIndex: 0, vsync: this, length: 6)
          ..addListener(
            () {
              var tempIndex = Provider.of<AppProvider>(context, listen: false)
                  .ideasTabController!
                  .index;
              // Provider.of<CategoryProvider>(context, listen: false)
              //     .changeNotifiers();
              Provider.of<CategoryPopUpProvider>(context, listen: false)
                  .changeTabIndex(tempIndex);
            },
          );

    categoryProvider.scrollController1.addListener(() async {
      if (categoryProvider.scrollController1.position.pixels >=
              categoryProvider.scrollController1.position.maxScrollExtent &&
          !ideaListProvider.ideaListLoading) {
        // Reload ListView with new data
        await Provider.of<ShareIdeasProvider>(context, listen: false)
            .getMoreIdealList(queryType: temp);
        ;
        print('NEW DATA CALL');
      }
    });
    categoryProvider.scrollController2.addListener(() async {
      if (categoryProvider.scrollController2.position.pixels >=
              categoryProvider.scrollController2.position.maxScrollExtent &&
          !ideaListProvider.ideaListLoading) {
        // Reload ListView with new data
        await Provider.of<AppQuestionsProvider>(context, listen: false)
            .getMoreIdealList(queryType: temp);
        ;
        print('NEW DATA CALL');
        print('AppQuestionsProvider');
      }
    });
    categoryProvider.scrollController3.addListener(() async {
      if (categoryProvider.scrollController3.position.pixels >=
              categoryProvider.scrollController3.position.maxScrollExtent &&
          !ideaListProvider.ideaListLoading) {
        // Reload ListView with new data
        await Provider.of<IdeaListProvider>(context, listen: false)
            .getMoreIdealList(queryType: temp);
        ;
        print('NEW DATA CALL');
      }
    });
    categoryProvider.scrollController4.addListener(() async {
      if (categoryProvider.scrollController4.position.pixels >=
              categoryProvider.scrollController4.position.maxScrollExtent &&
          !ideaListProvider.ideaListLoading) {
        // Reload ListView with new data
        await Provider.of<PortfolioProvider>(context, listen: false)
            .getMoreIdealList(queryType: temp);
        ;
        print('NEW DATA CALL');
      }
    });
    categoryProvider.scrollController5.addListener(() async {
      if (categoryProvider.scrollController5.position.pixels >=
              categoryProvider.scrollController5.position.maxScrollExtent &&
          !ideaListProvider.ideaListLoading) {
        // Reload ListView with new data
        await Provider.of<ColoursProvider>(context, listen: false)
            .getMoreIdealList(queryType: temp);
        print('NEW DATA CALL');
      }
    });
    categoryProvider.scrollController6.addListener(() async {
      if (categoryProvider.scrollController6.position.pixels >=
              categoryProvider.scrollController6.position.maxScrollExtent &&
          !ideaListProvider.ideaListLoading) {
        // Reload ListView with new data
        await Provider.of<SettingsProvider>(context, listen: false)
            .getMoreIdealList(queryType: temp);
        print('NEW DATA CALL');
      }
    });
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    ideaListProvider = Provider.of<IdeaListProvider>(context, listen: false);
    appQuestionsProvider =
        Provider.of<AppQuestionsProvider>(context, listen: false);
    portfolioProvider = Provider.of<PortfolioProvider>(context, listen: false);
    voteProvider = Provider.of<VoteProvider>(context, listen: false);
    CategoryProvider categoryProvider =
        Provider.of<CategoryProvider>(context, listen: false);

    double width = MediaQuery.of(context).size.width;

    double yourWidth = width / 3.5;

    var size = MediaQuery.of(context).size;
    return Consumer<AppProvider>(builder: (context, appPro, _) {
      int selectedTab = Provider.of<AppProvider>(context, listen: false)
          .ideasTabController!
          .index;

      return DefaultTabController(
        length: 6,
        child: Scaffold(
          floatingActionButton: Padding(
            padding: EdgeInsets.only(
                right: size.height * .01, bottom: size.height * .06),
            child: FloatingActionButton(
              backgroundColor: Colors.white,
              child: SvgPicture.asset('assets/images/float_svg.svg'),
              onPressed: () {
                showModalBottomSheet(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(30),
                      topRight: Radius.circular(30),
                    ),
                  ),
                  context: context,
                  isScrollControlled: true,
                  builder: (context) => PostModalSheet(),
                ).whenComplete(() {
                  appPro.check = false;
                  appPro.resetTextFields();
                });
              },
            ),
          ),
          backgroundColor: Colors.white,
          appBar: AppBar(
            elevation: 0,
            backgroundColor: Colors.white,
            leading: GestureDetector(
              onTap: () {
                Get.back();
              },
              child: const Icon(
                Icons.arrow_back_ios,
                color: Colors.black,
              ),
            ),
            title: Text(
              'Adevar Forum',
              style: TextStyle(
                  color: Colors.black,
                  fontSize: size.height * 0.023,
                  fontWeight: FontWeight.bold),
            ),
            centerTitle: true,
            actions: [
              InkWell(
                onTap: () {
                  // Get.to(()=>

                  // );
                },
                child: Image.asset(
                  'assets/images/mypost.png',
                  height: 30,
                  width: 30,
                ),
              ),
              SizedBox(
                width: size.width * 0.03,
              )
            ],
          ),
          body: Container(
            padding: EdgeInsets.only(
                top: size.height * 0.03,
                left: size.width * 0.04,
                right: size.width * 0.04),
            height: size.height,
            width: size.width,
            child: Stack(
              children: [
                Column(
                  children: [
                    SizedBox(
                      height: size.height * 0.21,
                      width: size.width,
                      child: FutureBuilder(
                        future: voteProvider.getVoteData(),
                        builder: (BuildContext context,
                            AsyncSnapshot<dynamic> snapshot) {
                          return Consumer<VoteProvider>(
                            builder: (context, VoteProvider voteProvider, _) {
                              if (voteProvider.voteDataLoading) {
                                return Center(
                                  child: Lottie.asset(
                                      'assets/animations/loading.json'),
                                );
                              } else {
                                return ListView.builder(
                                  scrollDirection: Axis.horizontal,
                                  itemCount: voteProvider.votedmodel.length,
                                  itemBuilder: (context, index) {
                                    return InkWell(
                                      onTap: () {
                                        if (index == 0) {
                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                              builder: (context) => Vote(),
                                            ),
                                          );
                                        } else if (index == 1) {
                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                              builder: (context) =>
                                                  VotedFeature(),
                                            ),
                                          );
                                        } else if (index == 2) {
                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                              builder: (context) =>
                                                  CurrentVersion(),
                                            ),
                                          );
                                        }
                                      },
                                      child: VoteBox(
                                        context,
                                        voteProvider.votedmodel[index].subtitle,
                                        voteProvider.votedmodel[index].img,
                                        voteProvider.votedmodel[index].color,
                                        voteProvider.votedmodel[index].title,
                                        voteProvider.votedmodel[index].userno,
                                      ),
                                    );
                                  },
                                );
                              }
                            },
                          );
                        },
                      ),
                    ),
                    SizedBox(
                      height: size.height * 0.03,
                    ),
                    Padding(
                      padding: EdgeInsets.all(size.width * 0.02),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Category',
                            style: TextStyle(
                                color: Colors.black,
                                fontSize: size.height * 0.03,
                                fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: size.height * 0.02),

                    SingleChildScrollView(
                      primary: false,
                      scrollDirection: Axis.horizontal,
                      controller: appPro.categoryTabsController,
                      child: Stack(
                        children: [
                          SizedBox(
                            width: size.width * 1.5,
                            height: size.height * .04,
                            child: ListView(
                              scrollDirection: Axis.horizontal,
                              physics: NeverScrollableScrollPhysics(),
                              children: [
                                SizedBox(
                                  height: size.height * 0.05,
                                  width: size.width * 1.5,
                                  child: TabBar(
                                    controller: appPro.ideasTabController,
                                    labelStyle: TextStyle(
                                        fontSize: size.height * 0.0165,
                                        fontWeight: FontWeight.w600),
                                    labelColor: blueColor,
                                    unselectedLabelColor:
                                        const Color(0xff8E8E93),
                                    indicatorSize: TabBarIndicatorSize.label,
                                    labelPadding:
                                        EdgeInsets.symmetric(horizontal: 0.0),
                                    onTap: (newTabIndex) {
                                      print(appPro.ideasTabController!.index);
                                    },
                                    tabs: const [
                                      Tab(text: 'Share Ideas'),
                                      Tab(text: 'App Question'),
                                      Tab(text: 'QR Code'),
                                      Tab(text: 'Portfolio'),
                                      Tab(text: 'Colours'),
                                      Tab(text: 'Settings'),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    // SingleChildScrollView(
                    //   scrollDirection: Axis.horizontal,
                    //   child:
                    // ),
                    SizedBox(
                      height: size.height * 0.02,
                    ),
                    Expanded(
                      child: CategoriesTabBarView(
                        tabController: appPro.ideasTabController,
                        ideaListProvider: ideaListProvider,
                        temp: temp,
                        scrollController1: categoryProvider.scrollController1,
                        scrollController2: categoryProvider.scrollController2,
                        scrollController3: categoryProvider.scrollController3,
                        scrollController4: categoryProvider.scrollController4,
                        scrollController5: categoryProvider.scrollController5,
                        scrollController6: categoryProvider.scrollController6,
                        appQuestionsProvider: appQuestionsProvider,
                        portfolioProvider: portfolioProvider,
                      ),
                    )
                  ],
                ),
                Consumer<CategoryPopUpProvider>(
                  builder: (context,
                      CategoryPopUpProvider categoryPopUpProvider, _) {
                    return Positioned(
                      right: 0,
                      top: size.height * 0.245,
                      child: Builder(
                        builder: (context) {
                          switch (categoryPopUpProvider.ideasTabIndex) {
                            case 0:
                              return ShareIdeaPopUp();
                            case 1:
                              return AppQuestionsPopUp();
                            case 2:
                              return QRCodePopUp();
                            case 3:
                              return PortfolioPopUp();
                            case 4:
                              return ColoursPopUp();
                            case 5:
                              return SettingsPopUp();
                            default:
                              return CategoryPopUp();
                          }
                        },
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      );
    });
  }
}
