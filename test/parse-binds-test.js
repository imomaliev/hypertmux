/* globals describe, it */
import assert from 'assert';;
import parseBinds from '../src/parse-binds';

const binds = `
bind-key    -T prefix C-o              rotate-window
bind-key    -T prefix C-z              suspend-client
bind-key    -T prefix Space            next-layout
bind-key    -T prefix !                break-pane
bind-key    -T prefix "                split-window -c #{pane_current_path}
bind-key    -T prefix #                list-buffers
bind-key    -T prefix $                command-prompt -I #S "rename-session '%%'"
bind-key    -T prefix %                split-window -h -c #{pane_current_path}
bind-key    -T prefix &                confirm-before -p "kill-window #W? (y/n)" kill-window
bind-key    -T prefix '                command-prompt -p index "select-window -t ':%%'"
bind-key    -T prefix (                switch-client -p
bind-key    -T prefix )                switch-client -n
bind-key    -T prefix ,                command-prompt -I #W "rename-window '%%'"
bind-key    -T prefix -                delete-buffer
bind-key    -T prefix .                command-prompt "move-window -t '%%'"
bind-key    -T prefix 0                select-window -t :=0
bind-key    -T prefix 1                select-window -t :=1
bind-key    -T prefix 2                select-window -t :=2
bind-key    -T prefix 3                select-window -t :=3
bind-key    -T prefix 4                select-window -t :=4
bind-key    -T prefix 5                select-window -t :=5
bind-key    -T prefix 6                select-window -t :=6
bind-key    -T prefix 7                select-window -t :=7
bind-key    -T prefix 8                select-window -t :=8
bind-key    -T prefix 9                select-window -t :=9
bind-key    -T prefix :                command-prompt
bind-key    -T prefix ;                last-pane
bind-key    -T prefix =                choose-buffer
bind-key    -T prefix ?                list-keys
bind-key    -T prefix D                choose-client
bind-key    -T prefix L                switch-client -l
bind-key    -T prefix M                select-pane -M
bind-key    -T prefix [                copy-mode
bind-key    -T prefix ]                paste-buffer
bind-key    -T prefix c                new-window -c #{pane_current_path}
bind-key    -T prefix d                detach-client
bind-key    -T prefix f                command-prompt "find-window '%%'"
bind-key    -T prefix i                display-message
bind-key    -T prefix l                last-window
bind-key    -T prefix m                select-pane -m
bind-key    -T prefix n                next-window
bind-key    -T prefix o                resize-pane -Z
bind-key    -T prefix p                previous-window
bind-key    -T prefix q                display-panes
bind-key    -T prefix r                refresh-client
bind-key    -T prefix s                split-window ~/smart-switch.rb
bind-key    -T prefix t                clock-mode
bind-key    -T prefix v                split-window -h -c #{pane_current_path} nvim
bind-key    -T prefix w                choose-window
bind-key    -T prefix x                confirm-before -p "kill-pane #P? (y/n)" kill-pane
bind-key    -T prefix z                resize-pane -Z
bind-key    -T prefix {                swap-pane -U
bind-key    -T prefix }                swap-pane -D
bind-key    -T prefix ~                show-messages
bind-key    -T prefix PPage            copy-mode -u
bind-key -r -T prefix Up               select-pane -U
bind-key -r -T prefix Down             select-pane -D
bind-key -r -T prefix Left             select-pane -L
bind-key -r -T prefix Right            select-pane -R
bind-key    -T prefix M-1              select-layout even-horizontal
bind-key    -T prefix M-2              select-layout even-vertical
bind-key    -T prefix M-3              select-layout main-horizontal
bind-key    -T prefix M-4              select-layout main-vertical
bind-key    -T prefix M-5              select-layout tiled
bind-key    -T prefix M-n              next-window -a
bind-key    -T prefix M-o              rotate-window -D
bind-key    -T prefix M-p              previous-window -a
bind-key -r -T prefix M-Up             resize-pane -U 5
bind-key -r -T prefix M-Down           resize-pane -D 5
bind-key -r -T prefix M-Left           resize-pane -L 5
bind-key -r -T prefix M-Right          resize-pane -R 5
bind-key -r -T prefix C-Up             resize-pane -U
bind-key -r -T prefix C-Down           resize-pane -D
bind-key -r -T prefix C-Left           resize-pane -L
bind-key -r -T prefix C-Right          resize-pane -R
bind-key    -T root   C-h              run-shell "(tmux display-message -p '#{pane_current_command}' | grep -iq vim && tmux send-keys C-h) || tmux select-pane -L"
bind-key    -T root   C-j              run-shell "(tmux display-message -p '#{pane_current_command}' | grep -iq vim && tmux send-keys C-j) || tmux select-pane -D"
bind-key    -T root   C-k              run-shell "(tmux display-message -p '#{pane_current_command}' | grep -iq vim && tmux send-keys C-k) || tmux select-pane -U"
bind-key    -T root   C-l              run-shell "(tmux display-message -p '#{pane_current_command}' | grep -iq vim && tmux send-keys C-l) || tmux select-pane -R"
bind-key    -T root   C-\              run-shell "(tmux display-message -p '#{pane_current_command}' | grep -iq vim && tmux send-keys 'C-\') || tmux select-pane -l"
bind-key    -T root   MouseDown1Pane   select-pane -t = ; send-keys -M
bind-key    -T root   MouseDown1Status select-window -t =
bind-key    -T root   MouseDown3Pane   if-shell -F -t = #{mouse_any_flag} "select-pane -t=; send-keys -M" "select-pane -mt="
bind-key    -T root   MouseDrag1Pane   if-shell -F -t = #{mouse_any_flag} "if -Ft= "#{pane_in_mode}" "copy-mode -M" "send-keys -M"" "copy-mode -M"
bind-key    -T root   MouseDrag1Border resize-pane -M
bind-key    -T root   WheelUpPane      if-shell -F -t = #{mouse_any_flag} "send-keys -M" "if -Ft= "#{pane_in_mode}" "send-keys -M" "copy-mode -et=""
bind-key    -T root   WheelUpStatus    previous-window
bind-key    -T root   WheelDownStatus  next-window
`

describe('parseBinds', () => {
  it('parses root binds', () => {
    const input = `
bind-key    -T root   C-h              run-shell go-left
bind-key    -T root   C-j              run-shell go-down
bind-key    -T root   C-k              run-shell go-up
bind-key    -T root   C-l              run-shell go-right
    `;


    const output = [
      {type: 'root', key: 'C-h', command: 'run-shell go-left'},
      {type: 'root', key: 'C-j', command: 'run-shell go-down'},
      {type: 'root', key: 'C-k', command: 'run-shell go-up'},
      {type: 'root', key: 'C-l', command: 'run-shell go-right'}
    ]

    assert.deepEqual(parseBinds(input), output);
  });
});

