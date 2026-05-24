import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:highfedilityadevar/micheal_code/core/provider/voted_feature_provider.dart';

class VotedFeaturedContainer extends StatefulWidget {
  final Size size;
  final int index;
  final String? title;
  final String? imageLogo;
  final int? gold;
  final int? likes;
  final int? todoDate;
  final int? progressDate;
  final int? doneDate;

  VotedFeaturedContainer({
    required this.size,
    required this.index,
    required this.title,
    required this.imageLogo,
    this.gold = 700,
    this.likes = 0,
    this.todoDate = 1636461638993,
    this.progressDate = 1636461638993,
    this.doneDate = 1636461638993,
  });

  @override
  State<VotedFeaturedContainer> createState() => _VotedFeaturedContainerState();
}

class _VotedFeaturedContainerState extends State<VotedFeaturedContainer> {
  final String? imageLogo = 'assets/images/ayesha.png';

  @override
  Widget build(BuildContext context) {
    return Consumer<VotedFeatureProvider>(
      builder: (context, VotedFeatureProvider votedFeatureProvider, _) {
        return Container(
          margin: EdgeInsets.only(bottom: 8),
          padding: EdgeInsets.all(widget.size.height * 0.013),
          decoration: BoxDecoration(
            color: Color(0xffe8fbe5),
            borderRadius: BorderRadius.circular(widget.size.height * 0.02),
          ),
          height: widget.index != votedFeatureProvider.selectedIndex
              ? widget.size.height * 0.11
              : widget.size.height * 0.34,
          width: widget.size.width,
          child: Column(
            children: [
              Row(
                children: [
                  Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      CircleAvatar(
                        backgroundColor: Colors.blue,
                        radius: 20,
                        backgroundImage: NetworkImage(
                          widget.imageLogo ?? 'assets/images/ayesha.png',
                        ),
                      ),
                      SizedBox(
                        height: widget.size.height * 0.004,
                      ),
                    ],
                  ),
                  SizedBox(
                    width: widget.size.width * 0.03,
                  ),
                  Container(
                    // color: Colors.purple,
                    width: widget.size.width / 1.8,
                    child: Text(
                      widget.title ?? 'Calendar Planning Function',
                      style: TextStyle(
                        fontSize: widget.size.height * 0.018,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ),
                  Spacer(),
                  SvgPicture.asset(
                    'assets/images/like_svg.svg',
                    height: widget.size.height * 0.018,
                  ),
                  SizedBox(
                    width: widget.size.width * 0.05,
                  ),
                  Text(
                    '${widget.likes}',
                    style: TextStyle(
                      color: Color(0xff8E8E93),
                    ),
                  ),
                  SizedBox(
                    width: widget.size.width * 0.015,
                  )
                ],
              ),
              SizedBox(
                height: widget.size.height * 0.001,
              ),
              InkWell(
                onTap: () {
                  votedFeatureProvider.changeSelectedIndex(widget.index);
                },
                child: Row(
                  children: [
                    SvgPicture.asset(
                      'assets/images/star_svg.svg',
                      height: widget.size.height * 0.018,
                    ),
                    Text(
                      '${widget.gold}',
                      style: TextStyle(
                        fontSize: widget.size.height * 0.016,
                        color: Color(0xffD7AD05),
                      ),
                    ),
                    Padding(
                      padding: EdgeInsets.only(left: widget.size.width * 0.3),
                      child: Visibility(
                          visible: !(widget.index ==
                              votedFeatureProvider.selectedIndex),
                          child: SvgPicture.asset(
                            'assets/images/arrowd_svg.svg',
                            height: widget.size.height * 0.011,
                          )),
                    )
                  ],
                ),
              ),
              Visibility(
                visible: widget.index == votedFeatureProvider.selectedIndex,
                child: Expanded(
                  child: Container(
                      padding: EdgeInsets.only(
                          left: widget.size.width * 0.14,
                          right: widget.size.width * 0.05),
                      height: widget.size.height,
                      width: widget.size.width,
                      child: Column(
                        children: [
                          SizedBox(
                            height: widget.size.height * 0.01,
                          ),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Column(
                                children: [
                                  CircleAvatar(
                                    radius: widget.size.height * 0.012,
                                    backgroundColor: Colors.grey,
                                  ),
                                  Container(
                                    height: widget.size.height * 0.055,
                                    width: widget.size.width * 0.0012,
                                    color: Colors.grey,
                                  )
                                ],
                              ),
                              Padding(
                                padding: EdgeInsets.only(
                                    top: widget.size.height * 0.002,
                                    left: widget.size.width * 0.01),
                                child: Text(
                                  'To Do',
                                  style: TextStyle(
                                      color: Colors.grey,
                                      fontSize: widget.size.height * 0.017),
                                ),
                              ),
                              Spacer(),
                              Padding(
                                padding: EdgeInsets.only(
                                    top: widget.size.height * 0.002,
                                    left: widget.size.width * 0.01),
                                child: Text(
                                  DateFormat.yMMMd('en_US')
                                      .format(
                                          DateTime.fromMillisecondsSinceEpoch(
                                              widget.todoDate ?? 1636461638993))
                                      .toString(),
                                  style: TextStyle(
                                      color: Colors.grey,
                                      fontSize: widget.size.height * 0.017),
                                ),
                              )
                            ],
                          ),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Column(
                                children: [
                                  CircleAvatar(
                                    radius: widget.size.height * 0.012,
                                    backgroundColor: Colors.grey,
                                  ),
                                  Container(
                                    height: widget.size.height * 0.055,
                                    width: widget.size.width * 0.0012,
                                    color: Colors.green,
                                  )
                                ],
                              ),
                              Padding(
                                padding: EdgeInsets.only(
                                    top: widget.size.height * 0.002,
                                    left: widget.size.width * 0.01),
                                child: Text(
                                  'In Progress',
                                  style: TextStyle(
                                      color: Colors.grey,
                                      fontSize: widget.size.height * 0.017),
                                ),
                              ),
                              Spacer(),
                              Padding(
                                padding: EdgeInsets.only(
                                    top: widget.size.height * 0.002,
                                    left: widget.size.width * 0.01),
                                child: Text(
                                  DateFormat.yMMMd('en_US')
                                      .format(
                                          DateTime.fromMillisecondsSinceEpoch(
                                              widget.progressDate ??
                                                  1636461638993))
                                      .toString(),
                                  // 'Oct 19,2021'
                                  style: TextStyle(
                                      color: Colors.grey,
                                      fontSize: widget.size.height * 0.017),
                                ),
                              )
                            ],
                          ),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Column(
                                children: [
                                  Container(
                                    height: widget.size.height * 0.025,
                                    width: widget.size.height * 0.025,
                                    decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                            color: Colors.green, width: 2)),
                                  )
                                ],
                              ),
                              Padding(
                                padding: EdgeInsets.only(
                                    top: widget.size.height * 0.002,
                                    left: widget.size.width * 0.01),
                                child: Text(
                                  'Done',
                                  style: TextStyle(
                                      color: Colors.green,
                                      fontSize: widget.size.height * 0.017),
                                ),
                              ),
                              Spacer(),
                              Padding(
                                padding: EdgeInsets.only(
                                    top: widget.size.height * 0.002,
                                    left: widget.size.width * 0.01),
                                child: Text(
                                  DateFormat.yMMMd('en_US')
                                      .format(
                                          DateTime.fromMillisecondsSinceEpoch(
                                              widget.doneDate ?? 1636461638993))
                                      .toString(),
                                  style: TextStyle(
                                      color: Colors.grey,
                                      fontSize: widget.size.height * 0.017),
                                ),
                              ),
                            ],
                          ),
                          Padding(
                            padding: EdgeInsets.only(
                                right: widget.size.width * 0.08,
                                top: widget.size.height * 0.01),
                            child: Visibility(
                                visible: votedFeatureProvider.selectedIndex ==
                                    widget.index,
                                child: InkWell(
                                  onTap: () {
                                    votedFeatureProvider
                                        .changeSelectedIndex(-1);
                                  },
                                  child: Container(
                                    height: widget.size.height * 0.02,
                                    width: widget.size.width,
                                    child: Column(
                                      mainAxisAlignment: MainAxisAlignment.end,
                                      children: [
                                        SvgPicture.asset(
                                          'assets/images/arrowu_svg.svg',
                                          height: widget.size.height * 0.011,
                                        ),
                                      ],
                                    ),
                                  ),
                                )),
                          )
                        ],
                      )),
                ),
              )
            ],
          ),
        );
      },
    );
  }
}
