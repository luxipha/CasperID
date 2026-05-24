// @dart=2.9

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:highfedilityadevar/provider/invitation_dialog_provider.dart';
import 'package:highfedilityadevar/utils/AppDataNotifiier.dart';
import 'package:highfedilityadevar/views/pages/edit_profile/edit_profile_page.dart';
import 'package:highfedilityadevar/views/pages/splash/splash_page.dart';
import 'package:provider/provider.dart';

import 'micheal_code/core/provider/app_provider.dart';
import 'micheal_code/core/provider/category_pop_up_provider.dart';
import 'micheal_code/core/provider/category_provider.dart';
import 'micheal_code/core/provider/idea_comment_provider.dart';
import 'micheal_code/core/provider/idea_info_provider.dart';
import 'micheal_code/core/provider/idea_providers/app_questions_provider.dart';
import 'micheal_code/core/provider/idea_providers/colours_provider.dart';
import 'micheal_code/core/provider/idea_providers/idea_list_provider.dart';
import 'micheal_code/core/provider/idea_providers/portfolio_provider.dart';
import 'micheal_code/core/provider/idea_providers/reject_ideas_provider.dart';
import 'micheal_code/core/provider/idea_providers/settings_provider.dart';
import 'micheal_code/core/provider/idea_providers/share_ideas_provider.dart';
import 'micheal_code/core/provider/submit_comment_provider.dart';
import 'micheal_code/core/provider/vote_idea_provider.dart';
import 'micheal_code/core/provider/vote_provider.dart';
import 'micheal_code/core/provider/voted_feature_provider.dart';
import 'micheal_widgets/humidity_slider/humidity.dart';
import 'micheal_widgets/humidity_slider/humidity_congfig.dart';
import 'provider/time_provider.dart';

Future<void> main() async {
  await GetStorage.init();
  runApp(MyApp());
}

final dataStorage = GetStorage();

class MyApp extends StatefulWidget {
  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  @override
  void initState() {
    super.initState();
  }

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (context) => AppDataNotifier()),
        ChangeNotifierProvider(create: (context) => TimeProvider()),
        Provider(create: (_) => HumidityConfig()),
        ChangeNotifierProvider(create: (context) => Humidity()),
        ChangeNotifierProvider(create: (context) => InvitationDialogProvider()),
        ChangeNotifierProvider(create: (context) => AppProvider()),
        //ChangeNotifierProvider(create: (context) => AppProvider()),
        ChangeNotifierProvider(create: (context) => IdeaListProvider()),
        ChangeNotifierProvider(create: (context) => VoteProvider()),
        ChangeNotifierProvider(create: (context) => CategoryProvider()),
        ChangeNotifierProvider(create: (context) => SubmitCommentProvider()),
        ChangeNotifierProvider(create: (context) => AppQuestionsProvider()),
        ChangeNotifierProvider(create: (context) => PortfolioProvider()),
        ChangeNotifierProvider(create: (context) => ShareIdeasProvider()),
        ChangeNotifierProvider(create: (context) => ColoursProvider()),
        ChangeNotifierProvider(create: (context) => SettingsProvider()),
        ChangeNotifierProvider(create: (context) => VoteIdeaProvider()),
        ChangeNotifierProvider(create: (context) => IdeaInfoProvider()),
        ChangeNotifierProvider(create: (context) => IdeaCommentProvider()),
        ChangeNotifierProvider(create: (context) => VotedFeatureProvider()),
        ChangeNotifierProvider(create: (context) => CategoryPopUpProvider()),
        ChangeNotifierProvider(create: (context) => RejectIdeasProvider()),
      ],
      child: GetMaterialApp(
        routes: {
          '/editProfilePage': (BuildContext context) => EditProfilePage()
        },
        debugShowCheckedModeBanner: false,
        title: 'Flutter Demo',
        // theme: ThemeData.light(),
        theme: ThemeData(
          appBarTheme: AppBarTheme(
            color: Colors.white,
            elevation: 0,
            iconTheme: IconThemeData(
              color: Colors.black,
            ),
          ),
          scaffoldBackgroundColor: Colors.white,
        ),
        home: SplashPage(),
      ),
    );
  }
}
