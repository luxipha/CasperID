import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../models/badgesModel/GetBadgesModel.dart';

class AvailableBadgesPage extends  StatefulWidget{
  final List<BadgesData> badgeData;

  const AvailableBadgesPage({Key? key, required this.badgeData}) : super(key: key);
  @override
  _AvailableBadgesPage createState()=>_AvailableBadgesPage();
}

class _AvailableBadgesPage extends State<AvailableBadgesPage> {
   List<BadgesData>? badgeData;

  @override
  void initState() {
    super.initState();
    badgeData = widget.badgeData;
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding:  EdgeInsets.only(bottom: 15.0),
      child: GridView.builder(
          physics: NeverScrollableScrollPhysics(),
          itemCount: badgeData?.length,
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 14,
              childAspectRatio: 1.0,
              mainAxisSpacing: 18),
              shrinkWrap: true,
              itemBuilder: (BuildContext context, int index) {
            return Column(
              children: [
                Container(
                  height: 95,
                  width: 95,
                  child: Image.network(
                    badgeData?[index].imgUrl,
                    height: 95,
                    width: 95,
                    fit: BoxFit.cover,
                  ),
                ),
                Text(badgeData?[index].name,style: GoogleFonts.roboto(color: Colors.black,fontWeight: FontWeight.w400,fontSize: 12),)
              ],
            );
          }),
    );
  }
}
