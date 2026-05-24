import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:highfedilityadevar/micheal_widgets/humidity_slider/theme.dart';
import 'package:highfedilityadevar/utils/fun_icons_icons.dart';


class SliderBall extends StatelessWidget {
  const SliderBall({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: BrandColors.sugarCane,
      ),
      height: kBallSize,
      width: kBallSize,
      alignment: Alignment.center,
      child: Icon(
        FunIcons.verticalArrows,
        color: BrandColors.fiord,
        size: 20,
      ),
    );
  }
}
