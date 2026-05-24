import 'package:flutter/material.dart';

import '../../Service/ApiFunctions/DataStatistics.dart';
import '../../widgets/colors..dart';
import '../../widgets/images.dart';
import '../models/vote_box_model.dart';

class VoteProvider extends ChangeNotifier {
  List<VoteModel> votedmodel = [];
  bool voteDataLoading = true;

  Future<void> getVoteData() async {
    if (votedmodel.isNotEmpty) {
      print('Vote Model has been gotten Already');
    } else {
      voteDataLoading = true;
      // if (votedmodel.isEmpty) {
      await DataStatistics().getEvents().then(
        (value) {
          votedmodel = [
            VoteModel(
                subtitle: "next version",
                img: hand,
                color: Color(0xff26C565),
                title: "Vote",
                userno: value!.data!.voteCount.toString()),
            VoteModel(
                subtitle: "feature",
                img: done,
                color: blueColor,
                title: "Voted",
                userno: value.data!.voteCount.toString()),
            VoteModel(
                subtitle: "version",
                img: clock,
                color: Color(0xffEDA136),
                title: "Current",
                userno: value.data!.currentCount.toString()),
          ];
        },
      );
      // } else {
      //   print('======> Vote Data has been gotten Already');
      // }
      voteDataLoading = false;
    }
  }
}
