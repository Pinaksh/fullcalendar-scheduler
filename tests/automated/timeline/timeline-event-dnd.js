// TODO: test isRtl?

import { getResourceTimelinePoint } from '../lib/timeline'

describe('timeline-view event drag-n-drop', function() {
  pushOptions({
    editable: true,
    now: '2015-11-29',
    resources: [
      { id: 'a', title: 'Resource A' },
      { id: 'b', title: 'Resource B' },
      { id: 'c', title: 'Resource C' }
    ],
    defaultView: 'timelineDay',
    scrollTime: '00:00'
  })

  describeTimeZones(function(tz) {

    it('allows switching date and resource', function(done) {
      let dropSpy
      initCalendar({
        events: [
          { title: 'event0', className: 'event0', start: '2015-11-29T02:00:00', end: '2015-11-29T03:00:00', resourceId: 'b' }
        ],
        _eventsPositioned: oneCall(function() {
          dragElTo($('.event0'), 'a', '2015-11-29T05:00:00', function() {
            expect(dropSpy).toHaveBeenCalled()
            done()
          })
        }),
        eventDrop:
          (dropSpy = spyCall(function(arg) {
            expect(arg.event.start).toEqualDate(tz.createDate('2015-11-29T05:00:00'))
            expect(arg.event.end).toEqualDate(tz.createDate('2015-11-29T06:00:00'))
            const resource = currentCalendar.getEventResource(arg.event)
            expect(resource.id).toBe('a')
          }))
      })
    })
  })

  it('can drag one of multiple event occurences', function(done) {
    initCalendar({
      events: [
        { title: 'event0', className: 'event0', start: '2015-11-29T02:00:00', end: '2015-11-29T03:00:00', resourceIds: [ 'a', 'b' ] }
      ],
      _eventsPositioned: oneCall(function() {
        dragElTo($('.event0:first'), 'c', '2015-11-29T05:00:00')
      }),
      eventDrop(arg) {
        setTimeout(function() { // let the drop rerender
          expect(arg.event.start).toEqualDate('2015-11-29T05:00:00Z')
          expect(arg.event.end).toEqualDate('2015-11-29T06:00:00Z')
          let resourceIds = arg.event.resources.map((resource) => resource.id)
          expect(resourceIds).toEqual([ 'b', 'c' ])
          done()
        })
      }
    })
  })

  it('can drag one of multiple event occurences, linked by same event-IDs', function(done) {
    initCalendar({
      events: [
        { id: '1', title: 'event0', className: 'event0', start: '2015-11-29T02:00:00', end: '2015-11-29T03:00:00', resourceId: 'a' },
        { id: '1', title: 'event1', className: 'event1', start: '2015-11-29T02:00:00', end: '2015-11-29T03:00:00', resourceId: 'b' }
      ],
      _eventsPositioned: oneCall(function() {
        dragElTo(
          $('.event0:first'),
          'c',
          '2015-11-29T05:00:00',
          null, // callback
          function() { // onBeforeRelease (happens BEFORE callback)
            expect($('.fc-mirror-container').length).toBe(2) // rendered two mirrors
          }
        )
      }),
      eventDrop(arg) {
        setTimeout(function() { // let the drop rerender
          const events = currentCalendar.clientEvents()

          expect(events[0].start).toEqualDate('2015-11-29T05:00:00Z')
          expect(events[0].end).toEqualDate('2015-11-29T06:00:00Z')
          expect(events[0].resources.length).toBe(1)
          expect(events[0].resources[0].id).toBe('c')

          expect(events[1].start).toEqualDate('2015-11-29T05:00:00Z')
          expect(events[1].end).toEqualDate('2015-11-29T06:00:00Z')
          expect(events[1].resources.length).toBe(1)
          expect(events[1].resources[0].id).toBe('b')

          done()
        })
      }
    })
  })

  it('can drag one of multiple event occurences onto an already-assigned resource', function(done) {
    initCalendar({
      events: [
        { title: 'event0', className: 'event0', start: '2015-11-29T02:00:00', end: '2015-11-29T03:00:00', resourceIds: [ 'a', 'b' ] }
      ],
      _eventsPositioned: oneCall(function() {
        dragElTo($('.event0:first'), 'b', '2015-11-29T05:00:00')
      }),
      eventDrop(arg) {
        setTimeout(function() { // let the drop rerender
          expect(arg.event.start).toEqualDate('2015-11-29T05:00:00Z')
          expect(arg.event.end).toEqualDate('2015-11-29T06:00:00Z')
          expect(arg.event.resources.length).toBe(1)
          expect(arg.event.resources[0].id).toBe('b')
          done()
        })
      }
    })
  })

  it('allows dragging via touch', function(done) {
    let dropSpy
    initCalendar({
      isTouch: true,
      longPressDelay: 100,
      events: [
        { title: 'event0', className: 'event0', start: '2015-11-29T02:00:00', end: '2015-11-29T03:00:00', resourceId: 'b' }
      ],
      _eventsPositioned: oneCall(function() {
        touchDragElTo($('.event0'), 200, 'a', '2015-11-29T05:00:00', function() {
          expect(dropSpy).toHaveBeenCalled()
          done()
        })
      }),
      eventDrop:
        (dropSpy = spyCall(function(arg) {
          expect(arg.event.start).toEqualDate('2015-11-29T05:00:00Z')
          expect(arg.event.end).toEqualDate('2015-11-29T06:00:00Z')
          const resource = currentCalendar.getEventResource(arg.event)
          expect(resource.id).toBe('a')
        }))
    })
  })

  it('restores resource correctly with revert', function(done) {
    initCalendar({
      events: [
        { title: 'event0', className: 'event0', start: '2015-11-29T02:00:00', end: '2015-11-29T03:00:00', resourceId: 'b' }
      ],
      _eventsPositioned: oneCall(function() {
        dragElTo($('.event0'), 'a', '2015-11-29T05:00:00')
      }),
      eventDrop(arg) {
        setTimeout(function() { // let the drop rerender
          expect(arg.event.start).toEqualDate('2015-11-29T05:00:00Z')
          expect(arg.event.end).toEqualDate('2015-11-29T06:00:00Z')
          expect(arg.event.resources.length).toBe(1)
          expect(arg.event.resources[0].id).toBe('a')
          arg.revert()

          let event = currentCalendar.clientEvents()[0]
          expect(event.start).toEqualDate('2015-11-29T02:00:00Z')
          expect(event.end).toEqualDate('2015-11-29T03:00:00Z')
          expect(event.resources.length).toBe(1)
          expect(event.resources[0].id).toBe('b')
          done()
        })
      }
    })
  })

  it('restores multiple resources correctly with revert', function(done) {
    initCalendar({
      events: [
        { title: 'event0', className: 'event0', start: '2015-11-29T02:00:00', end: '2015-11-29T03:00:00', resourceIds: [ 'a', 'b' ] }
      ],
      _eventsPositioned: oneCall(function() {
        dragElTo($('.event0:first'), 'c', '2015-11-29T05:00:00')
      }),
      eventDrop(arg) {
        setTimeout(function() { // let the drop rerender
          let resourceIds

          expect(arg.event.start).toEqualDate('2015-11-29T05:00:00Z')
          expect(arg.event.end).toEqualDate('2015-11-29T06:00:00Z')
          resourceIds = arg.event.resources.map((resource) => resource.id)
          expect(resourceIds).toEqual([ 'b', 'c' ])
          arg.revert()

          let event = currentCalendar.clientEvents()[0]
          expect(event.start).toEqualDate('2015-11-29T02:00:00Z')
          expect(event.end).toEqualDate('2015-11-29T03:00:00Z')
          resourceIds = event.resources.map((resource) => resource.id)
          expect(resourceIds).toEqual([ 'a', 'b' ])
          done()
        })
      }
    })
  })

  describe('when per-resource businessHours and eventConstraint', function() {
    pushOptions({
      now: '2015-11-27', // need a weekday
      businessHours: true,
      eventConstraint: 'businessHours'
    })

    it('allow dragging into custom matching range', function(done) {
      let dropSpy
      initCalendar({
        resources: [
          { id: 'a', title: 'Resource A', businessHours: { start: '02:00', end: '22:00' } },
          { id: 'b', title: 'Resource B' },
          { id: 'c', title: 'Resource C' }
        ],
        events: [
          { title: 'event0', className: 'event0', start: '2015-11-27T09:00', end: '2015-11-27T10:00', resourceId: 'b' }
        ],
        _eventsPositioned: oneCall(function() {
          dragElTo($('.event0'), 'a', '2015-11-27T05:00', function() {
            expect(dropSpy).toHaveBeenCalled()
            done()
          })
        }),
        eventDrop:
          (dropSpy = spyCall(function(arg) {
            expect(arg.event.start).toEqualDate('2015-11-27T05:00Z')
            expect(arg.event.end).toEqualDate('2015-11-27T06:00Z')
            const resource = currentCalendar.getEventResource(arg.event)
            expect(resource.id).toBe('a')
          }))
      })
    })

    it('disallow dragging into custom non-matching range', function(done) {
      let dropSpy
      initCalendar({
        resources: [
          { id: 'a', title: 'Resource A', businessHours: { start: '10:00', end: '16:00' } },
          { id: 'b', title: 'Resource B' },
          { id: 'c', title: 'Resource C' }
        ],
        events: [
          { title: 'event0', className: 'event0', start: '2015-11-27T09:00', end: '2015-11-27T10:00', resourceId: 'b' }
        ],
        _eventsPositioned: oneCall(function() {
          dragElTo($('.event0'), 'a', '2015-11-27T09:00:00', function() {
            expect(dropSpy).not.toHaveBeenCalled()
            done()
          })
        }),
        eventDrop:
          (dropSpy = spyCall(function(arg) {
            expect(arg.event.start).toEqualDate('2015-11-27T05:00:00Z')
            expect(arg.event.end).toEqualDate('2015-11-27T06:00:00Z')
            const resource = currentCalendar.getEventResource(arg.event)
            expect(resource.id).toBe('a')
          }))
      })
    })
  })

  function dragElTo(el, resourceId, date, callback, onBeforeRelease) {
    el.simulate('drag', {
      localPoint: { left: 0, top: '50%' },
      end: getResourceTimelinePoint(resourceId, date),
      onBeforeRelease,
      callback
    })
  }

  function touchDragElTo(el, delay, resourceId, date, callback) {
    $('.event0').simulate('drag', {
      isTouch: true,
      delay,
      localPoint: { left: 0, top: '50%' },
      end: getResourceTimelinePoint(resourceId, date),
      callback
    })
  }
})
