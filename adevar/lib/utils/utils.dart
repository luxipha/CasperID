String simplyFormat(
    {required DateTime time, bool dateOnly = false, String from = ""}) {
  String year = time.year.toString();

  // Add "0" on the left if month is from 1 to 9
  String month = time.month.toString().padLeft(2, '0');

  // Add "0" on the left if day is from 1 to 9
  String day = time.day.toString().padLeft(2, '0');

  // Add "0" on the left if hour is from 1 to 9
  String hour = time.hour.toString().padLeft(2, '0');

  // Add "0" on the left if minute is from 1 to 9
  String minute = time.minute.toString().padLeft(2, '0');

  // Add "0" on the left if second is from 1 to 9
  String second = time.second.toString().padLeft(2, '0');

  // If you only want year, month, and date
  if (dateOnly == false) {
    if (from == "comments") {
      return "$year.$month.$day $hour:$minute:$second";
    } else {
      return "$year-$month-$day $hour:$minute:$second";
    }
  }

  // return the "yyyy-MM-dd HH:mm:ss" format
  if (from == "userEditProfile") {
    return "$month/$day/$year";
  } else if (from == "update") {
    return "$year-$month-$day";
  }else if (from == "company") {
    return "$month/$day";
  } else if (from == "dialog") {
    return "$day $month $day";
  } else {
    return "$year.$month.$day";
  }
}
