import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:intl/intl.dart';
import 'package:lottie/lottie.dart';
import 'package:provider/provider.dart';

import '../Service/ApiModels/VotedFeatureIdeaModel.dart';
import '../core/provider/voted_feature_provider.dart';
import '../widgets/loading_idea_card.dart';
import '../widgets/reject_ideas_sheet.dart';
import '../widgets/voted feature/voted_featured_container.dart';
class VotedFeature extends StatefulWidget {
  const VotedFeature({Key? key}) : super(key: key);

  @override
  _VotedFeatureState createState() => _VotedFeatureState();
}

class _VotedFeatureState extends State<VotedFeature> {
  // bool check = false;
  // bool check2 = false;
  // bool check3 = false;
  int currentStep = 0;

  VotedFeatureIdeaModel? ideaModel;

  @override
  void initState() {
    super.initState();
    VotedFeatureProvider votedFeatureProvider =
        Provider.of<VotedFeatureProvider>(context, listen: false);

    votedFeatureProvider.scrollController.addListener(() async {
      if (votedFeatureProvider.scrollController.position.pixels >=
              votedFeatureProvider.scrollController.position.maxScrollExtent &&
          !votedFeatureProvider.isLoading) {
        // Reload ListView with new data
        await votedFeatureProvider.getMoreVotedFeature();
        ;
        print('NEW DATA CALL');
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    var size = MediaQuery.of(context).size;
    VotedFeatureProvider votedFeatureProvider =
        Provider.of<VotedFeatureProvider>(context, listen: false);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        centerTitle: true,
        elevation: 0,
        leading: InkWell(
          onTap: () {
            Navigator.pop(context);
          },
          child: Icon(
            Icons.arrow_back_ios,
            size: 25,
            color: Colors.black,
          ),
        ),
        title: Text(
          "Voted feature",
          style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: size.height * 0.025,
              color: Colors.black),
        ),
        actions: [
          Padding(
            padding: EdgeInsets.only(right: size.width * 0.04),
            child: InkWell(
              onTap: () {
                showModalBottomSheet(
                  backgroundColor: Colors.transparent,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(size.height * 0.06),
                  ),
                  context: context,
                  builder: (context) {
                    return RejectIdeasSheet(size: size);
                  },
                );
              },
              child: SvgPicture.asset(
                'assets/images/dots_svg.svg',
                height: size.height * 0.05,
              ),
            ),
          )
        ],
      ),
      body: FutureBuilder(
        future: votedFeatureProvider.getVotedFeature(),
        builder: (BuildContext context, AsyncSnapshot<dynamic> snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return ListView.builder(
              itemCount: 10,
              padding: EdgeInsets.symmetric(horizontal: 20),
              itemBuilder: (context, index) {
                return LoadingIdeaCard();
              },
            );
          } else {
            return Consumer<VotedFeatureProvider>(
              builder: (context, VotedFeatureProvider votedFeatureProvider, _) {
                if (votedFeatureProvider.votedFeatureIdeaModel == null) {
                  return Text('There is nothing to show');
                } else {
                  ideaModel = votedFeatureProvider.votedFeatureIdeaModel;

                  return Stack(
                    children: [
                      ListView.builder(
                        controller: votedFeatureProvider.scrollController,
                        padding: EdgeInsets.symmetric(horizontal: 20),
                        itemCount: ideaModel!.items!.length,
                        itemBuilder: (BuildContext context, int index) {
                          // print('====> ${_ideaModel!.items![index]}');

                          var itemsLength = ideaModel!.items!.length;
                          print('====>>>>>> $itemsLength');
                          print('====>>>>>> $index');
                          if (itemsLength != index) {
                            print('Yes');
                            var ideaStatusLog = ideaModel!
                                .items![index].userIdeaView!.ideaStatusLog;
                            var userIdeaView =
                                ideaModel!.items![index].userIdeaView;
                            var baseUserView =
                                ideaModel!.items![index].baseUserView;

                            bool ideaIsNull = ideaStatusLog == null;
                            bool userIdeaIsNull = ideaStatusLog == null;
                            bool baseUserViewIsNull = baseUserView == null;

                            // print(
                            //     '====> ${_ideaModel!.items![index].userIdeaView!.ideaStatusLog}');
                            return VotedFeaturedContainer(
                              size: size,
                              index: index,
                              title: userIdeaView!.text,
                              imageLogo: !baseUserViewIsNull
                                  ? baseUserView.logo
                                  : 'https://w0.peakpx.com/wallpaper/673/485/HD-wallpaper-raven-crow-crow-dark-for-phone-glow-glowing-hasaka-iphone-xr-itachi-mangekyou-neon-neon-phone-phone-x-portrait-raven-red-red-glow-rock-sharingan-sky-triangle-neon.jpg',
                              todoDate: !ideaIsNull
                                  ? ideaStatusLog.toDo
                                  : 1636461638993,
                              progressDate: !ideaIsNull
                                  ? ideaStatusLog.inProgress
                                  : 1636461638993,
                              doneDate: !ideaIsNull
                                  ? ideaStatusLog.done
                                  : 1636461638993,
                              gold: ideaModel!.items![index].userIdeaView!.gold,
                              likes: ideaModel!.items![index].likeCount!,
                            );
                          } else {
                            print('==> No');
                            return VotedFeaturedContainer(
                              size: size,
                              index: index,
                              title: 'Hello',
                              imageLogo:
                                  'https://w0.peakpx.com/wallpaper/673/485/HD-wallpaper-raven-crow-crow-dark-for-phone-glow-glowing-hasaka-iphone-xr-itachi-mangekyou-neon-neon-phone-phone-x-portrait-raven-red-red-glow-rock-sharingan-sky-triangle-neon.jpg',
                              todoDate: 1636461638993,
                              progressDate: 1636461638993,
                              doneDate: 1636461638993,
                              gold: 700,
                            );
                          }
                        },
                      ),
                      Visibility(
                        visible: votedFeatureProvider.isMoreLoading,
                        child: Positioned(
                          bottom: -50,
                          child: Container(
                            width: MediaQuery.of(context).size.width,
                            height: 200,
                            child:
                                Lottie.asset('assets/animations/loading.json'),
                          ),
                        ),
                      ),
                    ],
                  );
                }
              },
            );
          }
        },
      ),
    );
  }
}
