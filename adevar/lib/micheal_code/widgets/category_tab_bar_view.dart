import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'package:provider/provider.dart';
import 'package:highfedilityadevar/micheal_code/core/provider/app_provider.dart';
import 'package:highfedilityadevar/micheal_code/core/provider/idea_providers/app_questions_provider.dart';
import 'package:highfedilityadevar/micheal_code/core/provider/idea_providers/colours_provider.dart';
import 'package:highfedilityadevar/micheal_code/core/provider/idea_providers/idea_list_provider.dart';
import 'package:highfedilityadevar/micheal_code/core/provider/idea_providers/portfolio_provider.dart';
import 'package:highfedilityadevar/micheal_code/core/provider/idea_providers/settings_provider.dart';
import 'package:highfedilityadevar/micheal_code/core/provider/idea_providers/share_ideas_provider.dart';
import 'package:highfedilityadevar/micheal_code/widgets/loading_idea_card.dart';
import 'package:highfedilityadevar/micheal_code/widgets/qr_code.dart';

class CategoriesTabBarView extends StatefulWidget {
  const CategoriesTabBarView({
    Key? key,
    required TabController? tabController,
    required this.ideaListProvider,
    required this.temp,
    required this.scrollController1,
    required this.scrollController2,
    required this.scrollController3,
    required this.scrollController4,
    required this.scrollController5,
    required this.scrollController6,
    required this.appQuestionsProvider,
    required this.portfolioProvider,
  })  : _tabController = tabController,
        super(key: key);

  final TabController? _tabController;
  final IdeaListProvider ideaListProvider;
  final AppQuestionsProvider appQuestionsProvider;
  final PortfolioProvider portfolioProvider;
  final String temp;
  final ScrollController scrollController1;
  final ScrollController scrollController2;
  final ScrollController scrollController3;
  final ScrollController scrollController4;
  final ScrollController scrollController5;
  final ScrollController scrollController6;

  @override
  State<CategoriesTabBarView> createState() => _CategoriesTabBarViewState();
}

class _CategoriesTabBarViewState extends State<CategoriesTabBarView>
    with AutomaticKeepAliveClientMixin<CategoriesTabBarView> {
  @override
  bool get wantKeepAlive => true;

  void scrollTabLeft() {
    Provider.of<AppProvider>(context, listen: false)
        .categoryTabsController
        .jumpTo(
          Provider.of<AppProvider>(context, listen: false)
              .categoryTabsController
              .position
              .minScrollExtent,
        );
  }

  void scrollTabRight() {
    Provider.of<AppProvider>(context, listen: false)
        .categoryTabsController
        .jumpTo(
          Provider.of<AppProvider>(context, listen: false)
              .categoryTabsController
              .position
              .maxScrollExtent,
        );
  }

  @override
  void initState() {
    super.initState();

    Provider.of<AppProvider>(context, listen: false)
        .ideasTabController!
        .addListener(() {
      // This is to handle the auto scrolling of the tabs
      int tabIndex = Provider.of<AppProvider>(context, listen: false)
          .ideasTabController!
          .index;
      if (tabIndex < 3) {
        scrollTabLeft();
      } else {
        scrollTabRight();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final ShareIdeasProvider shareIdeasProvider =
        Provider.of<ShareIdeasProvider>(context, listen: false);
    final ColoursProvider coloursProvider =
        Provider.of<ColoursProvider>(context, listen: false);
    final SettingsProvider settingsProvider =
        Provider.of<SettingsProvider>(context, listen: false);
    final AppProvider appProvider =
        Provider.of<AppProvider>(context, listen: false);

    return Consumer<AppProvider>(
      builder: (context, AppProvider appPro, _) {
        return TabBarView(
          controller: appPro.ideasTabController,
          children: [
            FutureBuilder(
              future: shareIdeasProvider.getIdealList(queryType: widget.temp),
              builder: (BuildContext context, AsyncSnapshot<dynamic> snapshot) {
                // Scroll to the beginning of the tabs ListView
                appProvider.categoryTabsController.jumpTo(
                  appProvider.categoryTabsController.position.minScrollExtent,
                );

                return Consumer<ShareIdeasProvider>(
                  builder: (context, ShareIdeasProvider shareIdeasProvider, _) {
                    if (shareIdeasProvider.ideaListLoading) {
                      return ListView.builder(
                        itemCount: 4,
                        itemBuilder: (context, index) {
                          return LoadingIdeaCard();
                        },
                      );
                    } else {
                      if (shareIdeasProvider.idealList != null &&
                          shareIdeasProvider.idealList!.items != null &&
                          shareIdeasProvider.idealList!.items!.length == 0) {
                        return Center(
                          child: Text('There is nothing to show'),
                        );
                      } else {
                        print(
                            '==> There are ${shareIdeasProvider.idealList!.items!.length} Ideas on the list');
                        return Stack(
                          children: [
                            ListView.builder(
                              controller: widget.scrollController1,
                              itemCount:
                                  shareIdeasProvider.idealList!.items!.length,
                              itemBuilder: (context, index) {
                                print(
                                    'MyCreated ==> ${shareIdeasProvider.idealList!.items![index].created}');

                                return QRCodeTab(
                                  // context,
                                  tabTitle: 'Share Idea',
                                  id: shareIdeasProvider
                                      .idealList!.items![index].id,
                                  createdAt: shareIdeasProvider
                                          .idealList!.items![index].created ??
                                      20,
                                  title: shareIdeasProvider
                                      .idealList!.items![index].title,
                                  comments: shareIdeasProvider.idealList!
                                          .items![index].commentCount ??
                                      0,
                                  commentUsers: shareIdeasProvider.idealList!
                                          .items![index].commentUserCount ??
                                      0,
                                  like: shareIdeasProvider
                                          .idealList!.items![index].likeCount ??
                                      0,
                                  userInfo: shareIdeasProvider.idealList!
                                          .items![index].latestUserInfo ??
                                      [],
                                );
                              },
                            ),
                            Visibility(
                              visible: shareIdeasProvider.moreIdeaListLoading,
                              child: Positioned(
                                bottom: -40,
                                child: Center(
                                  child: Container(
                                    width: MediaQuery.of(context).size.width,
                                    child: Center(
                                      child: Lottie.asset(
                                        'assets/animations/loading.json',
                                        height: 200,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        );
                      }
                    }
                  },
                );
              },
            ),
            FutureBuilder(
              future: widget.appQuestionsProvider
                  .getIdealList(queryType: widget.temp),
              builder: (BuildContext context, AsyncSnapshot<dynamic> snapshot) {
                // Scroll to the beginning of the tabs ListView
                appProvider.categoryTabsController.jumpTo(
                  appProvider.categoryTabsController.position.minScrollExtent,
                );

                return Consumer<AppQuestionsProvider>(
                  builder: (context, AppQuestionsProvider ideaListProvider, _) {
                    if (ideaListProvider.ideaListLoading) {
                      return ListView.builder(
                        itemCount: 4,
                        itemBuilder: (context, index) {
                          return LoadingIdeaCard();
                        },
                      );
                    } else {
                      if (ideaListProvider.idealList!.items!.length == 0) {
                        return Center(
                          child: Text('There is nothing to show'),
                        );
                      } else {
                        print(
                            '==> There are ${ideaListProvider.idealList!.items!.length} Ideas on the list');
                        return Stack(
                          children: [
                            ListView.builder(
                              controller: widget.scrollController2,
                              itemCount:
                                  ideaListProvider.idealList!.items!.length,
                              itemBuilder: (context, index) {
                                print(
                                    '===Mikky===> ${ideaListProvider.idealList!.items![index].id.toString()}');

                                return QRCodeTab(
                                  // context,
                                  tabTitle: 'App Question',
                                  id: ideaListProvider
                                      .idealList!.items![index].id,
                                  createdAt: ideaListProvider
                                      .idealList!.items![index].created,
                                  title: ideaListProvider
                                      .idealList!.items![index].title,
                                  comments: ideaListProvider.idealList!
                                          .items![index].commentCount ??
                                      0,
                                  like: ideaListProvider
                                          .idealList!.items![index].likeCount ??
                                      0,
                                  userInfo: ideaListProvider.idealList!
                                          .items![index].latestUserInfo ??
                                      [],
                                  baseUserView: ideaListProvider.idealList!
                                      .toJson()['baseUserView'],
                                );
                              },
                            ),
                            Visibility(
                              visible: ideaListProvider.moreIdeaListLoading,
                              child: Positioned(
                                bottom: -40,
                                child: Center(
                                  child: Container(
                                    width: MediaQuery.of(context).size.width,
                                    child: Center(
                                      child: Lottie.asset(
                                        'assets/animations/loading.json',
                                        height: 200,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        );
                      }
                    }
                  },
                );
              },
            ),
            FutureBuilder(
              future:
                  widget.ideaListProvider.getIdealList(queryType: widget.temp),
              builder: (BuildContext context, AsyncSnapshot<dynamic> snapshot) {
                // Scroll to the beginning of the tabs ListView
                print(appProvider
                    .categoryTabsController.position.minScrollExtent);
                appProvider.categoryTabsController.jumpTo(
                  appProvider.categoryTabsController.position.minScrollExtent,
                );

                return Consumer<IdeaListProvider>(
                  builder: (context, IdeaListProvider ideaListProvider, _) {
                    if (ideaListProvider.ideaListLoading) {
                      return ListView.builder(
                        itemCount: 4,
                        itemBuilder: (context, index) {
                          return LoadingIdeaCard();
                        },
                      );
                    } else {
                      if (ideaListProvider.idealList!.items!.length == 0) {
                        return Center(
                          child: Text('There is nothing to show'),
                        );
                      } else {
                        print(
                            '==> There are ${ideaListProvider.idealList!.items!.length} Ideas on the list');
                        return Stack(
                          children: [
                            ListView.builder(
                              controller: widget.scrollController3,
                              itemCount:
                                  ideaListProvider.idealList!.items!.length,
                              itemBuilder: (context, index) {
                                return QRCodeTab(
                                  // context,
                                  tabTitle: 'QR Code',
                                  id: ideaListProvider
                                      .idealList!.items![index].id,
                                  createdAt: ideaListProvider
                                      .idealList!.items![index].created,
                                  title: ideaListProvider
                                      .idealList!.items![index].title,
                                  comments: ideaListProvider.idealList!
                                          .items![index].commentCount ??
                                      0,
                                  like: ideaListProvider
                                          .idealList!.items![index].likeCount ??
                                      0,
                                  userInfo: ideaListProvider.idealList!
                                          .items![index].latestUserInfo ??
                                      [],
                                );
                              },
                            ),
                            Visibility(
                              visible: ideaListProvider.moreIdeaListLoading,
                              child: Positioned(
                                bottom: -40,
                                child: Center(
                                  child: Container(
                                    width: MediaQuery.of(context).size.width,
                                    child: Center(
                                      child: Lottie.asset(
                                        'assets/animations/loading.json',
                                        height: 200,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        );
                      }
                    }
                  },
                );
              },
            ),
            FutureBuilder(
              future:
                  widget.portfolioProvider.getIdealList(queryType: widget.temp),
              builder: (BuildContext context, AsyncSnapshot<dynamic> snapshot) {
                // Scroll to the end of the tabs ListView
                appProvider.categoryTabsController.jumpTo(
                  appProvider.categoryTabsController.position.maxScrollExtent,
                );

                return Consumer<PortfolioProvider>(
                  builder: (context, PortfolioProvider portfolioProvider, _) {
                    if (portfolioProvider.ideaListLoading) {
                      return ListView.builder(
                        itemCount: 4,
                        itemBuilder: (context, index) {
                          return LoadingIdeaCard();
                        },
                      );
                    } else {
                      if (portfolioProvider.idealList!.items!.length == 0) {
                        return Center(
                          child: Text('There is nothing to show'),
                        );
                      } else {
                        print(
                            '==> There are ${portfolioProvider.idealList!.items!.length} Ideas on the list');
                        return Stack(
                          children: [
                            ListView.builder(
                              controller: widget.scrollController4,
                              itemCount:
                                  portfolioProvider.idealList!.items!.length,
                              itemBuilder: (context, index) {
                                return QRCodeTab(
                                  // context,
                                  tabTitle: 'Portfolio',
                                  id: portfolioProvider
                                      .idealList!.items![index].id,
                                  createdAt: portfolioProvider
                                      .idealList!.items![index].created,
                                  title: portfolioProvider
                                      .idealList!.items![index].title,
                                  comments: portfolioProvider.idealList!
                                          .items![index].commentCount ??
                                      0,
                                  like: portfolioProvider
                                          .idealList!.items![index].likeCount ??
                                      0,
                                  userInfo: portfolioProvider.idealList!
                                          .items![index].latestUserInfo ??
                                      [],
                                );
                              },
                            ),
                            Visibility(
                              visible: portfolioProvider.moreIdeaListLoading,
                              child: Positioned(
                                bottom: -40,
                                child: Center(
                                  child: Container(
                                    width: MediaQuery.of(context).size.width,
                                    child: Center(
                                      child: Lottie.asset(
                                        'assets/animations/loading.json',
                                        height: 200,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        );
                      }
                    }
                  },
                );
              },
            ),
            FutureBuilder(
              future: coloursProvider.getIdealList(queryType: widget.temp),
              builder: (BuildContext context, AsyncSnapshot<dynamic> snapshot) {
                // Scroll to the end of the tabs ListView
                appProvider.categoryTabsController.jumpTo(
                  appProvider.categoryTabsController.position.maxScrollExtent,
                );

                return Consumer<ColoursProvider>(
                  builder: (context, ColoursProvider coloursProvider, _) {
                    if (coloursProvider.ideaListLoading) {
                      return ListView.builder(
                        itemCount: 4,
                        itemBuilder: (context, index) {
                          return LoadingIdeaCard();
                        },
                      );
                    } else {
                      if (coloursProvider.idealList!.items!.length == 0) {
                        return Center(
                          child: Text('There is nothing to show'),
                        );
                      } else {
                        print(
                            '==> There are ${coloursProvider.idealList!.items!.length} Ideas on the list');
                        return Stack(
                          children: [
                            ListView.builder(
                              controller: widget.scrollController5,
                              itemCount:
                                  coloursProvider.idealList!.items!.length,
                              itemBuilder: (context, index) {
                                return QRCodeTab(
                                  // context,
                                  tabTitle: 'Colours',
                                  id: coloursProvider
                                      .idealList!.items![index].id,
                                  createdAt: coloursProvider
                                      .idealList!.items![index].created,
                                  title: coloursProvider
                                      .idealList!.items![index].title,
                                  comments: coloursProvider.idealList!
                                          .items![index].commentCount ??
                                      0,
                                  like: coloursProvider
                                          .idealList!.items![index].likeCount ??
                                      0,
                                  userInfo: coloursProvider.idealList!
                                          .items![index].latestUserInfo ??
                                      [],
                                );
                              },
                            ),
                            Visibility(
                              visible: coloursProvider.moreIdeaListLoading,
                              child: Positioned(
                                bottom: -40,
                                child: Center(
                                  child: Container(
                                    width: MediaQuery.of(context).size.width,
                                    child: Center(
                                      child: Lottie.asset(
                                        'assets/animations/loading.json',
                                        height: 200,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        );
                      }
                    }
                  },
                );
              },
            ),
            FutureBuilder(
              future: settingsProvider.getIdealList(queryType: widget.temp),
              builder: (BuildContext context, AsyncSnapshot<dynamic> snapshot) {
                // Scroll to the end of the tabs ListView
                appProvider.categoryTabsController.jumpTo(
                  appProvider.categoryTabsController.position.maxScrollExtent,
                );

                return Consumer<SettingsProvider>(
                  builder: (context, SettingsProvider settingsProvider, _) {
                    if (settingsProvider.ideaListLoading) {
                      return ListView.builder(
                        itemCount: 4,
                        itemBuilder: (context, index) {
                          return LoadingIdeaCard();
                        },
                      );
                    } else {
                      if (settingsProvider.idealList!.items!.length == 0) {
                        return Center(
                          child: Text('There is nothing to show'),
                        );
                      } else {
                        print(
                            '==> There are ${settingsProvider.idealList!.items!.length} Ideas on the list');
                        return Stack(
                          children: [
                            ListView.builder(
                              controller: widget.scrollController6,
                              itemCount:
                                  settingsProvider.idealList!.items!.length,
                              itemBuilder: (context, index) {
                                return QRCodeTab(
                                  // context,
                                  tabTitle: 'Settings',
                                  id: settingsProvider
                                      .idealList!.items![index].id,
                                  createdAt: settingsProvider
                                      .idealList!.items![index].created,
                                  title: settingsProvider
                                      .idealList!.items![index].title,
                                  comments: settingsProvider.idealList!
                                          .items![index].commentCount ??
                                      0,
                                  like: settingsProvider
                                          .idealList!.items![index].likeCount ??
                                      0,
                                  userInfo: settingsProvider.idealList!
                                          .items![index].latestUserInfo ??
                                      [],
                                );
                              },
                            ),
                            Visibility(
                              visible: settingsProvider.moreIdeaListLoading,
                              child: Positioned(
                                bottom: -40,
                                child: Center(
                                  child: Container(
                                    width: MediaQuery.of(context).size.width,
                                    child: Center(
                                      child: Lottie.asset(
                                        'assets/animations/loading.json',
                                        height: 200,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        );
                      }
                    }
                  },
                );
              },
            ),
          ],
        );
      },
    );
  }
}
