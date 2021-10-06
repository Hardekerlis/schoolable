const generateDayData = (selectedDay) => {

  const selDayData = [
    {
      title: 'Svenska 10',
      start: selectedDay.set({hour: 12}),
      end: selectedDay.set({hour: 13}),
      location: 'PBA',
      color: '#2C6DBC',
      fullDay: true
    },
    {
      title: 'Svenska 2',
      start: selectedDay.set({hour: 13, minute: 30}),
      end: selectedDay.set({hour: 14, minute: 37}),
      location: 'WHOOP',
      fullDay: true
    },
    {
      title: 'Svenska hejhejhej 2',
      start: selectedDay.set({hour: 11, minute: 30}),
      end: selectedDay.set({hour: 11, minute: 55}),
      location: 'rummet'
    },
    {
      title: 'Svenska 1 2',
      start: selectedDay.set({hour: 11, minute: 30}),
      end: selectedDay.set({hour: 11, minute: 55}),
      location: 'rummet'
    },
    {
      title: 'Svenska hejhejhej 2',
      start: selectedDay.set({hour: 11, minute: 30}),
      end: selectedDay.set({hour: 11, minute: 55}),
      location: 'rummet'
    },
  ]

  const selSecond = selectedDay.plus({day: 1});
  const selSecondDay = [
    {
      title: 'Svenska',
      start: selSecond.set({hour: 12, minute: 30}),
      end: selSecond.set({hour: 13}),
      location: 'PBA'
    },
    {
      title: 'Svenska 2',
      start: selSecond.set({hour: 13, minute: 30}),
      end: selSecond.set({hour: 14, minute: 37}),
      location: 'WHOOP'
    },
    {
      title: 'Svenska hejhejhej 2',
      start: selSecond.set({hour: 11, minute: 30}),
      end: selSecond.set({hour: 11, minute: 55}),
      location: 'rummet'
    },
  ]

  const selThird = selSecond.plus({day: 1});
  const selThirdDay = [
    {
      title: 'Svenska',
      start: selThird.set({hour: 12}),
      end: selThird.set({hour: 13}),
      location: 'PBA'
    },
    {
      title: 'Svenska 2',
      start: selThird.set({hour: 13, minute: 30}),
      end: selThird.set({hour: 14, minute: 37}),
      location: 'WHOOP'
    },
    {
      title: 'Svenska hejhejhej 2',
      start: selThird.set({hour: 11, minute: 30}),
      end: selThird.set({hour: 11, minute: 55}),
      location: 'rummet'
    },
    {
      title: 'Svenska hejhejhej 3',
      start: selThird.set({hour: 11, minute: 30}),
      end: selThird.set({hour: 11, minute: 55}),
      location: 'rummet'
    }
  ]

  const selFourth = selThird.plus({day: 1});
  const selFourthDay = [
    {
      title: 'Svenska',
      start: selFourth.set({hour: 12}),
      end: selFourth.set({hour: 13}),
      location: 'PBA'
    },
    {
      title: 'Svenska 2',
      start: selFourth.set({hour: 13, minute: 30}),
      end: selFourth.set({hour: 14, minute: 37}),
      location: 'WHOOP'
    },
    {
      title: 'Svenska hejhejhej 2',
      start: selFourth.set({hour: 11, minute: 30}),
      end: selFourth.set({hour: 11, minute: 55}),
      location: 'rummet'
    },

    {
      title: 'Svenska hejhejhej 3',
      start: selFourth.set({hour: 11, minute: 30}),
      end: selFourth.set({hour: 11, minute: 55}),
      location: 'rummet'
    }
  ]

  const selFifth = selFourth.plus({day: 1});
  const selFifthDay = [
    {
      title: 'Svenska',
      start: selFifth.set({hour: 12}),
      end: selFifth.set({hour: 13}),
      location: 'PBA'
    },
    {
      title: 'Svenska 2',
      start: selFifth.set({hour: 13, minute: 30}),
      end: selFifth.set({hour: 14, minute: 37}),
      location: 'WHOOP'
    },
    {
      title: 'Svenska hejhejhej 2',
      start: selFifth.set({hour: 11, minute: 30}),
      end: selFifth.set({hour: 11, minute: 55}),
      location: 'rummet'
    },

    {
      title: 'Svenska hejhejhej 3',
      start: selFifth.set({hour: 11, minute: 30}),
      end: selFifth.set({hour: 11, minute: 55}),
      location: 'rummet'
    }
  ]

  const selSixth = selFifth.plus({day: 1});
  const selSixthDay = [
    {
      title: 'Svenska',
      start: selSixth.set({hour: 12}),
      end: selSixth.set({hour: 13}),
      location: 'PBA'
    },
    {
      title: 'Svenska 2',
      start: selSixth.set({hour: 13, minute: 30}),
      end: selSixth.set({hour: 14, minute: 37}),
      location: 'WHOOP'
    },
    {
      title: 'Svenska hejhejhej 2',
      start: selSixth.set({hour: 11, minute: 30}),
      end: selSixth.set({hour: 11, minute: 55}),
      location: 'rummet'
    },

    {
      title: 'Svenska hejhejhej 3',
      start: selSixth.set({hour: 11, minute: 30}),
      end: selSixth.set({hour: 11, minute: 55}),
      location: 'rummet'
    }
  ]

  const selSeventh = selSixth.plus({day: 1});
  const selSeventhDay = [
    {
      title: 'Svenska',
      start: selSeventh.set({hour: 12}),
      end: selSeventh.set({hour: 13}),
      location: 'PBA'
    },
    {
      title: 'Svenska 2',
      start: selSeventh.set({hour: 13, minute: 30}),
      end: selSeventh.set({hour: 14, minute: 37}),
      location: 'WHOOP'
    },
    {
      title: 'Svenska hejhejhej 2',
      start: selSeventh.set({hour: 11, minute: 30}),
      end: selSeventh.set({hour: 11, minute: 55}),
      location: 'rummet'
    },

    {
      title: 'Svenska hejhejhej 3',
      start: selSeventh.set({hour: 11, minute: 30}),
      end: selSeventh.set({hour: 11, minute: 55}),
      location: 'rummet'
    }
  ];

  return {
    sevenDayData: selDayData.concat(selSecondDay).concat(selThirdDay).concat(selFourthDay).concat(selFifthDay).concat(selSixthDay).concat(selSeventhDay),
    threeDayData: selDayData.concat(selSecondDay).concat(selThirdDay),
    oneDayData: selDayData
  }

}

export default generateDayData;
