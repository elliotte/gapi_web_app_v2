class CirclesController < ApplicationController

	before_action :get_circle, except: [:index, :create, :circles_names, :user_team_member_circles]

	def index
		@circles = User.find_by(google_id: params[:user_google_id]).circles
    	respond_to do |format|
		  	format.html
		  	format.json { render json: @circles }
		end
	end

	def circles_names
		user = User.find_by(google_id: session[:user_google_id])
	    circle_names = []
	    if user.present?
		    circles = user.circles.where("display_name ilike ?", "%#{params[:q]}%").order('display_name ASC')
		    circles.each do |circle|
		      circle_names.push({ id: circle.id, name: circle.display_name})
		    end
		end
	    render json: circle_names.to_json
  	end

	def new
		@circle = Circle.new
	end

	def user_team_member_circles
		memberCircles = TeamMember.find(:all, :conditions => ["google_id LIKE ?", "#{params[:user_google_id]}%"])
		render json: memberCircles.to_json
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
	    @user = session[:user_email]
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
		#{"utf8"=>"✓", "circle"=>{"message"=>""}, "commit"=>"Add Message", "action"=>"add_message", "controller"=>"circles", "id"=>"5"}
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
		end
		@div_id = @type + '-' + @item.id.to_s
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

	def get_circle
		@circle = Circle.find(params[:id])
	end

	def circle_params
   		params.require(:circle).permit(:display_name, :description)
 	end
end
