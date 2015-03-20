class CirclesController < ApplicationController

	before_action :get_circle, except: [:index, :create, :circles_names, :add_friend_to_team]
	before_filter :authorize_user, only: :show

	def index
		@circles = User.find_by(google_id: params[:user_google_id]).circles
    	respond_to do |format|
		  	format.html
		  	format.json { render json: @circles }
		end
	end
	#retrieve users circle names
	def circles_names
		gSession_id = session[:user_google_id]
		user = User.find_by(google_id: gSession_id)
	    if user.present?
	    	circle_names = user.load_my_team_names(params[:q], gSession_id)
		end
	    render json: circle_names.to_json
  	end
  	# retrieves a circles teamFiles
  	def circle_files
  		@team_files = @circle.team_files
		render json: @team_files
  	end
    ##retrieves for landing, AJAX fetch
  	def circle_peoples
  		@team_members = @circle.team_members
		render json: @team_members
  	end
    # post request for adding G+ friends to a moneateam
  	def add_friend_to_team
  		team = Circle.find(params[:circle_id])
		person_g_id = params[:person_google_id]
		user = User.find_by(google_id: person_g_id)
		teamfiles = team.team_files
		team_member = TeamMember.find_by(circle_id: team.id, google_id: person_g_id) 
		#files_shared = false
		if team_member.present?
			team_member
		else
			team_member = TeamMember.create(circle_id: team.id, google_id: person_g_id)
            if teamfiles.present?
            	Circle.share_team_files($client, user, teamfiles)
            end
        end
	    respond_to do |format|
	      	format.js { @team_member = team_member }
	    end
  	end

  	def remove_team_member
  		@member = TeamMember.find_by(circle_id: params[:id], google_id: params[:google_id])
		if @member.destroy 
			@message = "Success".to_json
			render json: @message
		else
			@message = "Failure".to_json
			render json: @message
		end
  	end

	def new
		@circle = Circle.new
	end

	def show
		# Create a string for verification
	    if !session[:state]
	      state = (0...13).map{('a'..'z').to_a[rand(26)]}.join
	      session[:state] = state
	    end
	    @state = session[:state]
	    @messages = @circle.messages.all
	    @wallpins = @circle.wallpins.all
	    #@user = session[:user_email]
		respond_to do |format|
			format.html
	    	format.js { @circle }
    	end
	end

	def edit
		respond_to do |format|
	    	format.js { @circle }
    	end
	end

	def create
		case
		when !params[:circle][:user_id]
			redirect_to root_path, notice: 'Cannot find user, trying signing in and out'
		when params[:circle][:user_id]
			circle = Circle.new(circle_params)
			circle.user_id = User.find_by(google_id: params[:circle][:user_id]).id
			if circle.save
				redirect_to circle_path(circle.id)
			else
				redirect_to root_path , notice: 'Something went wrong trying to add circle boss' 
			end
		end 
	end

	def update
		if @circle.update_attributes(circle_params)
			# render json: @circle
			redirect_to circle_path(@circle.id)
		else
			# render json: "Circle not updated"
			redirect_to root_path
		end
	end

	def destroy
		if @circle.destroy
			# render json: "Circle deleted"
			redirect_to root_path
		else
			# render json: "Circle not deleted"
			redirect_to root_path
		end
	end

	def destroy_show
		respond_to do |format|
	    	format.js { @circle }
    	end
	end

	def add_message
		@message = @circle.messages.new(text: params[:circle][:message], added_by: session[:user_email])
		if @message.save
			respond_to do |format|
	    		format.js { @message }
    		end
    	else
    		respond_to do |format|
	    		format.js { @message = nil }
    		end
    	end
	end

	def add_wallpin
		@pin = @circle.wallpins.new(summary: params[:circle][:summary], added_by: session[:user_email], file_link: params[:circle][:file_link] )
		if @pin.save
			respond_to do |format|
	    		format.js { @pin }
    		end
    	else
    		respond_to do |format|
	    		format.js { @pin = nil }
    		end
    	end
	end

	def delete_item 
		case 
		when params[:circle][:item_type] == "pin" 
			@item = @circle.wallpins.find_by(id: params[:circle][:item_id])
			@type = "pin"
		when params[:circle][:item_type] == "message" 
			@item = @circle.messages.find_by(id: params[:circle][:item_id])
			@type = "message"
		when params[:circle][:item_type] == "team-file" 
			@item = @circle.team_files.find_by(file_id: params[:circle][:item_id])
			@type = "team-file"
		end
		@div_id = @type + '-' + @item.id.to_s
		if params[:circle][:item_type] == "team-file"
			@div_id = params[:circle][:item_id]
		end
		if @item.destroy
			respond_to do |format|
	    		format.js { @div_id }
    		end
    	else
    		respond_to do |format|
	    		format.js { @item = nil }
    		end
    	end
	end

	private

	def authorize_user
		if !session[:user_google_id]
			redirect_to root_path
		else
			if @circle.user_id == current_user.id
				return true
			else
				if @circle.team_members.where(google_id: session[:user_google_id]).present?
					return true
				else
					redirect_to root_path
				end
			end
		end
	end

	def get_circle
		@circle = Circle.find(params[:id])
	end

	def circle_params
   		params.require(:circle).permit(:display_name, :description)
 	end
end
